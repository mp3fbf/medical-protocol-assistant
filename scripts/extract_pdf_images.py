#!/usr/bin/env python3
"""
Script para extrair páginas de PDFs com detecção inteligente de fluxogramas.
Utilizado para análise visual de protocolos médicos.

Uso:
    python extract_pdf_images.py arquivo1.pdf arquivo2.pdf ...
    python extract_pdf_images.py "pasta/*.pdf"
    python extract_pdf_images.py --dpi 400 arquivo.pdf
    python extract_pdf_images.py --no-auto-detect arquivo.pdf
"""

import os
import sys
import argparse
import glob
import cv2
import numpy as np
from pdf2image import convert_from_path
from PIL import Image
from pathlib import Path


def detect_flowchart_keywords(image):
    """
    Detecta palavras-chave típicas de fluxogramas médicos usando OCR.
    
    Args:
        image: PIL Image
    
    Returns:
        int: Pontuação baseada em palavras-chave encontradas
    """
    try:
        import pytesseract
        
        # Converter para texto
        text = pytesseract.image_to_string(image, lang='por').upper()
        
        # Palavras-chave de decisão
        decision_keywords = ['SIM', 'NÃO', 'SE', 'ENTÃO', 'OU', 'E/OU']
        action_keywords = ['AVALIAR', 'ADMINISTRAR', 'SOLICITAR', 'INICIAR', 
                          'CONSIDERAR', 'ENCAMINHAR', 'MONITORAR', 'VERIFICAR']
        flow_keywords = ['→', '↓', '➜', 'FLUXO', 'PROTOCOLO', 'ALGORITMO']
        
        score = 0
        details = []
        
        # Contar ocorrências
        decision_count = sum(text.count(kw) for kw in decision_keywords)
        action_count = sum(text.count(kw) for kw in action_keywords)
        flow_count = sum(text.count(kw) for kw in flow_keywords)
        
        if decision_count >= 2:
            score += 20
            details.append(f"✓ {decision_count} palavras de decisão encontradas")
        
        if action_count >= 3:
            score += 15
            details.append(f"✓ {action_count} palavras de ação encontradas")
            
        if flow_count >= 1:
            score += 10
            details.append(f"✓ {flow_count} indicadores de fluxo encontrados")
        
        return score, details
        
    except ImportError:
        # pytesseract não instalado
        return 0, ["OCR não disponível (instale pytesseract)"]
    except Exception:
        return 0, ["Erro ao analisar texto"]


def detect_flowchart(image):
    """
    Detecta se uma imagem contém um fluxograma médico usando múltiplos critérios.
    
    Args:
        image: PIL Image ou numpy array
    
    Returns:
        tuple: (is_flowchart, confidence, details)
    """
    # Converter PIL Image para numpy array se necessário
    if hasattr(image, 'convert'):
        # É uma PIL Image
        img_array = np.array(image.convert('RGB'))
        pil_image = image
    else:
        img_array = image
        pil_image = Image.fromarray(image)
    
    # Converter para escala de cinza
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    
    # Inicializar pontuação e detalhes
    score = 0
    max_score = 0
    details = []
    
    # 1. Detectar formas geométricas (caixas, círculos, losangos)
    # Aplicar threshold
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    
    # Encontrar contornos
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Contar formas retangulares e outras formas
    rectangles = 0
    diamonds = 0
    circles = 0
    
    for contour in contours:
        # Ignorar contornos muito pequenos
        area = cv2.contourArea(contour)
        if area < 500:
            continue
            
        # Aproximar o contorno
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        
        # Classificar forma
        vertices = len(approx)
        if vertices == 4:
            # Verificar se é retângulo ou losango
            x, y, w, h = cv2.boundingRect(approx)
            aspect_ratio = float(w) / h if h > 0 else 0
            
            if 0.8 <= aspect_ratio <= 1.2:
                # Pode ser um losango de decisão
                diamonds += 1
            else:
                rectangles += 1
        elif vertices > 6:
            # Provavelmente um círculo
            circles += 1
    
    # Pontuação baseada em formas
    if rectangles >= 3:
        score += 30
        details.append(f"✓ {rectangles} caixas/retângulos detectados")
        max_score += 30
    else:
        details.append(f"✗ Apenas {rectangles} caixas detectadas")
        max_score += 30
    
    if diamonds >= 1:
        score += 20
        details.append(f"✓ {diamonds} losangos de decisão detectados")
        max_score += 20
    else:
        max_score += 20
    
    # 2. Detectar linhas e conectores
    # Detectar linhas usando HoughLinesP
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, 100, minLineLength=50, maxLineGap=10)
    
    if lines is not None:
        num_lines = len(lines)
        if num_lines >= 5:
            score += 20
            details.append(f"✓ {num_lines} linhas/conectores detectados")
        else:
            details.append(f"✗ Apenas {num_lines} linhas detectadas")
        max_score += 20
    else:
        details.append("✗ Nenhuma linha detectada")
        max_score += 20
    
    # 3. Análise de densidade de elementos gráficos vs texto
    # Calcular proporção de pixels não-brancos
    non_white_pixels = np.count_nonzero(thresh)
    total_pixels = gray.shape[0] * gray.shape[1]
    graphics_density = non_white_pixels / total_pixels
    
    # Fluxogramas geralmente têm densidade moderada (5-30%)
    if 0.05 <= graphics_density <= 0.30:
        score += 15
        details.append(f"✓ Densidade gráfica apropriada ({graphics_density:.1%})")
    else:
        details.append(f"✗ Densidade gráfica atípica ({graphics_density:.1%})")
    max_score += 15
    
    # 4. Detectar presença de setas (através de análise de formas triangulares)
    arrows = 0
    for contour in contours:
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        if len(approx) == 3:  # Triângulo (possível ponta de seta)
            arrows += 1
    
    if arrows >= 2:
        score += 15
        details.append(f"✓ {arrows} possíveis setas detectadas")
    else:
        details.append(f"✗ Poucas setas detectadas ({arrows})")
    max_score += 15
    
    # 5. Análise de palavras-chave (se OCR disponível)
    keyword_score, keyword_details = detect_flowchart_keywords(pil_image)
    if keyword_score > 0:
        score += keyword_score
        max_score += 45  # Máximo possível de keywords
        details.extend(keyword_details)
    
    # Calcular confiança
    confidence = (score / max_score) * 100 if max_score > 0 else 0
    is_flowchart = confidence >= 50  # Threshold de 50% para considerar fluxograma
    
    return is_flowchart, confidence, details


def extract_pdf_pages(pdf_path, output_base_folder=None, dpi=300, zoom_pages=None, auto_detect=True):
    """
    Extrai todas as páginas de um PDF em alta resolução
    
    Args:
        pdf_path: Caminho do arquivo PDF
        output_base_folder: Pasta base para saída (padrão: pdf_images na pasta do PDF)
        dpi: Resolução de extração (padrão: 300)
        zoom_pages: Lista de números de páginas para aplicar zoom (ex: [1, 3, 5])
        auto_detect: Se deve detectar fluxogramas automaticamente
    
    Returns:
        Lista de caminhos dos arquivos extraídos
    """
    pdf_path = Path(pdf_path)
    
    if not pdf_path.exists():
        print(f"Erro: PDF não encontrado - {pdf_path}")
        return []
    
    # Determinar pasta de saída
    if output_base_folder is None:
        output_base_folder = pdf_path.parent / "pdf_images"
    else:
        output_base_folder = Path(output_base_folder)
    
    # Criar subpasta para este PDF
    pdf_name = pdf_path.stem
    pdf_output_folder = output_base_folder / pdf_name.replace(" ", "_")
    pdf_output_folder.mkdir(parents=True, exist_ok=True)
    
    print(f"\nProcessando: {pdf_name}")
    print(f"Extraindo com {dpi} DPI...")
    print(f"Saída: {pdf_output_folder}")
    
    try:
        # Converter PDF em imagens com alta resolução
        pages = convert_from_path(str(pdf_path), dpi=dpi)
        extracted_files = []
        
        for i, page in enumerate(pages):
            # Salvar página em alta resolução
            page_num = i + 1
            filename = f"{pdf_name}_page_{page_num:03d}.png"
            filepath = pdf_output_folder / filename
            
            # Salvar como PNG sem compressão para máxima qualidade
            page.save(filepath, 'PNG', optimize=False, quality=100)
            extracted_files.append(str(filepath))
            
            # Verificar se deve aplicar zoom nesta página
            width, height = page.size
            should_zoom = False
            
            # Verificar se página está na lista de zoom manual
            if zoom_pages and page_num in zoom_pages:
                should_zoom = True
                print(f"  Página {page_num}: Zoom solicitado manualmente (dimensões: {width}x{height})")
            elif auto_detect:
                # Usar nova detecção de fluxograma
                is_flowchart, confidence, detection_details = detect_flowchart(page)
                
                if is_flowchart:
                    should_zoom = True
                    print(f"  Página {page_num}: Fluxograma detectado (confiança: {confidence:.1f}%)")
                    for detail in detection_details:
                        print(f"    {detail}")
                else:
                    print(f"  Página {page_num}: Página normal (confiança fluxograma: {confidence:.1f}%)")
            else:
                print(f"  Página {page_num}: Extraída (detecção automática desabilitada)")
            
            if should_zoom:
                # Criar versão com zoom extra
                zoom_filename = f"{pdf_name}_page_{page_num:03d}_zoom.png"
                zoom_filepath = pdf_output_folder / zoom_filename
                
                # Aplicar zoom de 2x
                zoomed = page.resize((width * 2, height * 2), Image.Resampling.LANCZOS)
                zoomed.save(zoom_filepath, 'PNG', optimize=False, quality=100)
                extracted_files.append(str(zoom_filepath))
                print(f"    → Versão com zoom salva: {zoom_filename}")
        
        print(f"Total de arquivos extraídos: {len(extracted_files)}")
        return extracted_files
        
    except Exception as e:
        print(f"Erro ao processar {pdf_name}: {str(e)}")
        print("Certifique-se de ter o poppler-utils instalado:")
        print("  macOS: brew install poppler")
        print("  Ubuntu: sudo apt-get install poppler-utils")
        print("  Windows: baixar de https://github.com/oschwartz10612/poppler-windows")
        return []


def main():
    parser = argparse.ArgumentParser(
        description='Extrai páginas de PDFs com detecção inteligente de fluxogramas',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  # Extrair um único PDF
  python extract_pdf_images.py protocolo.pdf
  
  # Extrair múltiplos PDFs
  python extract_pdf_images.py arquivo1.pdf arquivo2.pdf
  
  # Extrair todos os PDFs de uma pasta
  python extract_pdf_images.py "DAK-10 - Delirium/*.pdf"
  
  # Especificar resolução customizada
  python extract_pdf_images.py --dpi 400 protocolo.pdf
  
  # Especificar pasta de saída
  python extract_pdf_images.py --output ./imagens protocolo.pdf
  
  # Aplicar zoom em páginas específicas
  python extract_pdf_images.py --zoom-pages 1,3,5-7 protocolo.pdf
  
  # Desabilitar detecção automática de fluxogramas
  python extract_pdf_images.py --no-auto-detect protocolo.pdf
        """
    )
    
    parser.add_argument('pdfs', nargs='+', help='Arquivos PDF para processar (suporta wildcards)')
    parser.add_argument('--dpi', type=int, default=300, help='Resolução de extração em DPI (padrão: 300)')
    parser.add_argument('--output', help='Pasta base para saída (padrão: pdf_images na pasta do PDF)')
    parser.add_argument('--zoom-pages', help='Páginas específicas para aplicar zoom (ex: 1,3,5-7)', default='')
    parser.add_argument('--no-auto-detect', action='store_true', help='Desabilitar detecção automática de fluxogramas')
    
    args = parser.parse_args()
    
    # Processar páginas para zoom
    zoom_pages = set()
    if args.zoom_pages:
        for part in args.zoom_pages.split(','):
            if '-' in part:
                # Range de páginas (ex: 5-7)
                start, end = map(int, part.split('-'))
                zoom_pages.update(range(start, end + 1))
            else:
                # Página única
                zoom_pages.add(int(part))
    
    # Expandir wildcards e coletar todos os PDFs
    all_pdfs = []
    for pattern in args.pdfs:
        if '*' in pattern or '?' in pattern:
            # É um padrão glob
            matched_files = glob.glob(pattern)
            all_pdfs.extend([f for f in matched_files if f.lower().endswith('.pdf')])
        else:
            # É um arquivo específico
            if pattern.lower().endswith('.pdf'):
                all_pdfs.append(pattern)
    
    if not all_pdfs:
        print("Erro: Nenhum arquivo PDF encontrado")
        sys.exit(1)
    
    print(f"=== Extração de PDFs com Detecção Inteligente de Fluxogramas ===")
    print(f"PDFs encontrados: {len(all_pdfs)}")
    print(f"Resolução: {args.dpi} DPI")
    print(f"Detecção automática: {'Desabilitada' if args.no_auto_detect else 'Ativada'}")
    
    all_extracted_files = []
    
    for pdf_path in all_pdfs:
        files = extract_pdf_pages(
            pdf_path, 
            args.output, 
            args.dpi, 
            zoom_pages if zoom_pages else None,
            auto_detect=not args.no_auto_detect
        )
        all_extracted_files.extend(files)
    
    print("\n=== Resumo da Extração ===")
    print(f"Total de PDFs processados: {len(all_pdfs)}")
    print(f"Total de imagens extraídas: {len(all_extracted_files)}")
    
    if all_extracted_files:
        print("\nPrimeiras 5 imagens extraídas:")
        for filepath in all_extracted_files[:5]:
            print(f"  {filepath}")
        if len(all_extracted_files) > 5:
            print(f"  ... e mais {len(all_extracted_files) - 5} arquivos")


if __name__ == "__main__":
    main()