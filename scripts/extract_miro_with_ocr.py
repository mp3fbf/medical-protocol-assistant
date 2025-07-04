#!/usr/bin/env python3
"""
Script de extração de Miro com OCR e validação para minimizar erros de leitura.
Especialmente focado em identificação precisa de medicamentos e dosagens.
"""

import os
import sys
import argparse
import json
import io
from pathlib import Path
import cv2
import numpy as np
import fitz  # PyMuPDF
from PIL import Image
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict, Tuple, Optional
import re
from difflib import SequenceMatcher
import pytesseract


@dataclass
class ExtractedText:
    """Representa texto extraído com metadados"""
    text: str
    confidence: float
    bbox: Tuple[int, int, int, int]
    source_image: str
    ocr_raw: str
    validation_status: str  # 'validated', 'suspicious', 'invalid'
    validation_notes: List[str]
    alternatives: List[str]  # Possíveis alternativas de leitura


@dataclass
class MedicationEntry:
    """Representa uma entrada de medicação extraída"""
    name: str
    dosage: str
    route: str
    frequency: str
    confidence: float
    source_region: str
    bbox: Tuple[int, int, int, int]
    validation_notes: List[str]


class MedicalDictionary:
    """Dicionário de termos médicos para validação"""
    
    def __init__(self):
        # Medicamentos comuns em protocolos de delirium
        self.medications = {
            'haloperidol', 'quetiapina', 'risperidona', 'olanzapina',
            'dexmedetomidina', 'midazolam', 'propofol', 'fentanil',
            'morfina', 'tramadol', 'dipirona', 'paracetamol',
            'tiamina', 'vitamina b1', 'vitamina b12', 'ácido fólico',
            'lorazepam', 'diazepam', 'clonazepam'
        }
        
        # Vias de administração
        self.routes = {
            'vo', 'oral', 'ev', 'iv', 'endovenoso', 'intravenoso',
            'im', 'intramuscular', 'sc', 'subcutâneo', 'sl', 'sublingual',
            'sng', 'sonda', 'tópico', 'retal'
        }
        
        # Unidades de dosagem
        self.units = {
            'mg', 'mcg', 'g', 'ml', 'l', 'ui', 'amp', 'ampola',
            'cp', 'comprimido', 'gts', 'gotas', 'mg/ml', 'mcg/ml'
        }
        
        # Termos que podem ser confundidos
        self.confusables = {
            'tramadol': ['transamina', 'transaminase', 'tramontina'],
            'haloperidol': ['haldol', 'haloperdol', 'haloperiol'],
            'tiamina': ['tianina', 'tramina', 'triamina'],
            'morfina': ['mofina', 'morphina', 'morfine']
        }
    
    def validate_medication(self, text: str) -> Dict:
        """Valida se o texto é um medicamento conhecido"""
        text_lower = text.lower().strip()
        
        # Busca exata
        if text_lower in self.medications:
            return {
                'valid': True,
                'confidence': 1.0,
                'matched': text_lower,
                'type': 'exact_match'
            }
        
        # Busca por similaridade
        best_match = None
        best_score = 0
        
        for med in self.medications:
            score = SequenceMatcher(None, text_lower, med).ratio()
            if score > best_score and score > 0.8:
                best_score = score
                best_match = med
        
        if best_match:
            return {
                'valid': True,
                'confidence': best_score,
                'matched': best_match,
                'type': 'fuzzy_match',
                'original': text
            }
        
        # Verificar se é um termo confundível
        for med, confusables in self.confusables.items():
            if text_lower in confusables:
                return {
                    'valid': False,
                    'confidence': 0.0,
                    'matched': None,
                    'type': 'confusable',
                    'suggestion': med,
                    'warning': f"'{text}' pode ser confundido com '{med}'"
                }
        
        return {
            'valid': False,
            'confidence': 0.0,
            'matched': None,
            'type': 'unknown'
        }


class MiroOCRExtractor:
    def __init__(self, pdf_path, output_dir=None):
        self.pdf_path = Path(pdf_path)
        self.output_dir = Path(output_dir) if output_dir else self.pdf_path.parent / "miro_ocr_extraction"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.dictionary = MedicalDictionary()
        self.extracted_texts = []
        self.medications = []
        self.validation_report = {
            'total_extractions': 0,
            'validated': 0,
            'suspicious': 0,
            'invalid': 0,
            'medications_found': [],
            'warnings': []
        }
    
    def preprocess_for_ocr(self, image):
        """Pré-processa imagem para melhorar OCR"""
        # Converter para escala de cinza
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image
        
        # Aumentar contraste
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        
        # Binarização adaptativa
        binary = cv2.adaptiveThreshold(enhanced, 255, 
                                     cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                     cv2.THRESH_BINARY, 11, 2)
        
        # Remover ruído
        denoised = cv2.medianBlur(binary, 3)
        
        return denoised
    
    def extract_text_with_confidence(self, image, region_name=""):
        """Extrai texto com níveis de confiança"""
        # Tentar OCR direto primeiro (sem pré-processamento excessivo)
        # para imagens já bem formatadas como tabelas
        processed = image
        
        # OCR com dados detalhados
        ocr_data = pytesseract.image_to_data(processed, output_type=pytesseract.Output.DICT, lang='por')
        
        # Extrair texto com confiança
        extracted_items = []
        n_boxes = len(ocr_data['text'])
        
        # Debug: mostrar primeiros resultados
        print(f"    OCR encontrou {n_boxes} elementos")
        # Mostrar todos os textos com confiança > 50
        texts_found = []
        for i in range(n_boxes):
            if ocr_data['text'][i].strip() and int(ocr_data['conf'][i]) > 50:
                texts_found.append(f"{ocr_data['text'][i]} ({ocr_data['conf'][i]}%)")
        
        if texts_found:
            print(f"    Textos detectados: {', '.join(texts_found[:20])}")
        
        for i in range(n_boxes):
            if int(ocr_data['conf'][i]) > 0:  # Apenas texto com alguma confiança
                text = ocr_data['text'][i].strip()
                if text:
                    bbox = (ocr_data['left'][i], ocr_data['top'][i], 
                           ocr_data['width'][i], ocr_data['height'][i])
                    
                    # Criar entrada de texto extraído
                    item = ExtractedText(
                        text=text,
                        confidence=float(ocr_data['conf'][i]) / 100.0,
                        bbox=bbox,
                        source_image=region_name,
                        ocr_raw=text,
                        validation_status='pending',
                        validation_notes=[],
                        alternatives=[]
                    )
                    
                    # Validar se é medicamento
                    med_validation = self.dictionary.validate_medication(text)
                    if med_validation['valid'] or med_validation['type'] == 'confusable':
                        item.validation_notes.append(f"Medication check: {med_validation}")
                        
                        if med_validation['type'] == 'confusable':
                            item.validation_status = 'suspicious'
                            item.alternatives.append(med_validation['suggestion'])
                            self.validation_report['warnings'].append(med_validation['warning'])
                    
                    extracted_items.append(item)
        
        return extracted_items
    
    def detect_tables(self, image):
        """Detecta regiões que parecem ser tabelas"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY) if len(image.shape) == 3 else image
        
        # Detectar linhas horizontais e verticais
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40,1))
        vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1,40))
        
        # Detectar linhas
        _, binary = cv2.threshold(gray, 250, 255, cv2.THRESH_BINARY_INV)
        horizontal_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horizontal_kernel)
        vertical_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, vertical_kernel)
        
        # Combinar linhas
        table_mask = cv2.add(horizontal_lines, vertical_lines)
        
        # Encontrar contornos de tabelas
        contours, _ = cv2.findContours(table_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        table_regions = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if w > 100 and h > 50:  # Filtrar regiões pequenas
                table_regions.append((x, y, w, h))
        
        return table_regions
    
    def extract_table_content(self, image, table_bbox, region_name):
        """Extrai conteúdo específico de tabelas com validação extra"""
        x, y, w, h = table_bbox
        table_img = image[y:y+h, x:x+w]
        
        # Salvar imagem da tabela para debug
        table_path = self.output_dir / f"table_{region_name}_{x}_{y}.png"
        Image.fromarray(table_img).save(table_path)
        
        # Extrair texto com OCR
        items = self.extract_text_with_confidence(table_img, f"table_{region_name}")
        
        # Análise contextual para tabelas de medicamentos
        self.analyze_medication_context(items, table_img)
        
        return items
    
    def analyze_medication_context(self, items, table_image):
        """Analisa contexto para identificar medicamentos em tabelas"""
        # Agrupar items por proximidade vertical (mesma linha)
        lines = self.group_by_lines(items)
        
        for line_items in lines:
            # Procurar padrões de medicamento + dosagem + via
            medication_pattern = self.find_medication_pattern(line_items)
            
            if medication_pattern:
                med_entry = MedicationEntry(
                    name=medication_pattern['name'],
                    dosage=medication_pattern['dosage'],
                    route=medication_pattern['route'],
                    frequency=medication_pattern.get('frequency', ''),
                    confidence=medication_pattern['confidence'],
                    source_region=line_items[0].source_image,
                    bbox=self.merge_bboxes([item.bbox for item in line_items]),
                    validation_notes=[]
                )
                
                self.medications.append(med_entry)
                self.validation_report['medications_found'].append(asdict(med_entry))
    
    def group_by_lines(self, items):
        """Agrupa items de texto por linha (proximidade vertical)"""
        if not items:
            return []
        
        # Ordenar por posição Y
        sorted_items = sorted(items, key=lambda x: x.bbox[1])
        
        lines = []
        current_line = [sorted_items[0]]
        current_y = sorted_items[0].bbox[1]
        
        for item in sorted_items[1:]:
            if abs(item.bbox[1] - current_y) < 20:  # Mesma linha
                current_line.append(item)
            else:
                lines.append(current_line)
                current_line = [item]
                current_y = item.bbox[1]
        
        if current_line:
            lines.append(current_line)
        
        return lines
    
    def find_medication_pattern(self, line_items):
        """Identifica padrão de medicamento em uma linha"""
        texts = [item.text for item in line_items]
        line_text = ' '.join(texts)
        
        # Padrões comuns
        patterns = [
            r'(\w+)\s+(\d+\s*(?:mg|mcg|g|ml)(?:/ml)?)',  # Nome dosagem
            r'(\w+)\s+(\d+\s*(?:mg|mcg|g|ml)(?:/ml)?)\s+(\w+)',  # Nome dosagem via
        ]
        
        for pattern in patterns:
            match = re.search(pattern, line_text, re.IGNORECASE)
            if match:
                potential_med = match.group(1)
                validation = self.dictionary.validate_medication(potential_med)
                
                if validation['valid'] or validation['type'] == 'confusable':
                    return {
                        'name': validation.get('matched', potential_med),
                        'dosage': match.group(2),
                        'route': match.group(3) if len(match.groups()) > 2 else '',
                        'confidence': validation['confidence']
                    }
        
        return None
    
    def merge_bboxes(self, bboxes):
        """Mescla múltiplas bounding boxes"""
        if not bboxes:
            return (0, 0, 0, 0)
        
        min_x = min(bbox[0] for bbox in bboxes)
        min_y = min(bbox[1] for bbox in bboxes)
        max_x = max(bbox[0] + bbox[2] for bbox in bboxes)
        max_y = max(bbox[1] + bbox[3] for bbox in bboxes)
        
        return (min_x, min_y, max_x - min_x, max_y - min_y)
    
    def process_region(self, image, region_name):
        """Processa uma região com foco em precisão"""
        print(f"Processando região: {region_name}")
        
        # Detectar tabelas
        tables = self.detect_tables(image)
        
        if tables:
            print(f"  {len(tables)} tabelas detectadas")
            for i, table_bbox in enumerate(tables):
                items = self.extract_table_content(image, table_bbox, f"{region_name}_table{i}")
                self.extracted_texts.extend(items)
        else:
            # Processar imagem completa
            items = self.extract_text_with_confidence(image, region_name)
            self.extracted_texts.extend(items)
        
        self.validation_report['total_extractions'] = len(self.extracted_texts)
    
    def generate_validation_report(self):
        """Gera relatório detalhado de validação"""
        # Contar status
        for item in self.extracted_texts:
            if item.validation_status == 'validated':
                self.validation_report['validated'] += 1
            elif item.validation_status == 'suspicious':
                self.validation_report['suspicious'] += 1
            else:
                self.validation_report['invalid'] += 1
        
        # Salvar relatório
        report_path = self.output_dir / "validation_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.validation_report, f, indent=2, ensure_ascii=False)
        
        # Criar relatório markdown
        self.create_markdown_report()
        
        return report_path
    
    def create_markdown_report(self):
        """Cria relatório em Markdown para fácil leitura"""
        md_content = f"""# Relatório de Extração OCR - {self.pdf_path.name}

## Resumo

- **Total de extrações**: {self.validation_report['total_extractions']}
- **Validadas**: {self.validation_report['validated']}
- **Suspeitas**: {self.validation_report['suspicious']}
- **Inválidas**: {self.validation_report['invalid']}

## Medicamentos Encontrados

| Nome | Dosagem | Via | Confiança | Notas |
|------|---------|-----|-----------|-------|
"""
        
        for med in self.validation_report['medications_found']:
            md_content += f"| {med['name']} | {med['dosage']} | {med['route']} | {med['confidence']:.2f} | {', '.join(med['validation_notes'])} |\n"
        
        if self.validation_report['warnings']:
            md_content += "\n## Avisos\n\n"
            for warning in self.validation_report['warnings']:
                md_content += f"- ⚠️ {warning}\n"
        
        md_content += f"\n## Itens Suspeitos\n\n"
        for item in self.extracted_texts:
            if item.validation_status == 'suspicious':
                md_content += f"- **{item.text}** (confiança: {item.confidence:.2f})\n"
                md_content += f"  - Alternativas: {', '.join(item.alternatives)}\n"
                md_content += f"  - Fonte: {item.source_image}\n\n"
        
        # Salvar relatório
        report_path = self.output_dir / "validation_report.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        print(f"Relatório Markdown salvo: {report_path}")


def main():
    parser = argparse.ArgumentParser(
        description='Extração OCR de Miro com validação médica',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument('image_or_dir', 
                       help='Imagem ou diretório com imagens extraídas do Miro')
    parser.add_argument('--output', 
                       help='Diretório de saída')
    parser.add_argument('--lang', default='por', 
                       help='Idioma para OCR (padrão: por)')
    
    args = parser.parse_args()
    
    # Configurar Tesseract - detectar instalação
    import subprocess
    try:
        # Detectar caminho do tesseract
        tesseract_path = subprocess.check_output(['which', 'tesseract']).decode().strip()
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
        print(f"Tesseract encontrado em: {tesseract_path}")
        
        # Detectar idiomas disponíveis
        langs = subprocess.check_output([tesseract_path, '--list-langs']).decode()
        if args.lang not in langs:
            print(f"Aviso: idioma '{args.lang}' não disponível. Usando 'eng'")
            args.lang = 'eng'
    except:
        print("Erro: Tesseract não encontrado. Instale com: brew install tesseract tesseract-lang")
        sys.exit(1)
    
    # Criar extrator
    extractor = MiroOCRExtractor(args.image_or_dir, args.output)
    
    # Processar imagens
    input_path = Path(args.image_or_dir)
    
    if input_path.is_file():
        # Processar única imagem
        img = cv2.imread(str(input_path))
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        extractor.process_region(img_rgb, input_path.stem)
    else:
        # Processar diretório
        for img_path in input_path.glob("*.png"):
            print(f"\nProcessando: {img_path.name}")
            img = cv2.imread(str(img_path))
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            extractor.process_region(img_rgb, img_path.stem)
    
    # Gerar relatório
    report_path = extractor.generate_validation_report()
    print(f"\nRelatório de validação salvo: {report_path}")


if __name__ == "__main__":
    main()