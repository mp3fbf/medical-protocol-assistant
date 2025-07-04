#!/usr/bin/env python3
"""
Script de extração progressiva para Miro - abordagem hierárquica com zoom adaptativo.
Começa com visão geral e vai refinando progressivamente onde há conteúdo.
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
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
from dataclasses import dataclass
from typing import List, Tuple, Optional
import hashlib


@dataclass
class QuadrantInfo:
    """Informações sobre um quadrante"""
    level: int
    parent_id: str
    quadrant_id: str
    bbox: Tuple[int, int, int, int]  # x, y, w, h
    has_content: bool
    content_density: float
    extracted_path: Optional[str] = None
    children: List['QuadrantInfo'] = None
    
    def __post_init__(self):
        if self.children is None:
            self.children = []


class MiroProgressiveExtractor:
    def __init__(self, pdf_path, output_dir=None, base_dpi=300, max_level=3):
        self.pdf_path = Path(pdf_path)
        self.base_dpi = base_dpi
        self.max_level = max_level
        self.output_dir = Path(output_dir) if output_dir else self.pdf_path.parent / "miro_progressive"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Estrutura hierárquica de quadrantes
        self.quadrant_tree = []
        self.all_quadrants = []
        
        # Configurações
        self.min_content_density = 0.001  # 0.1% de pixels não-brancos
        self.density_threshold_for_subdivision = 0.01  # 1% para subdividir
        
    def extract_page_at_dpi(self, page_num=0, dpi=None):
        """Extrai página em DPI específico"""
        if dpi is None:
            dpi = self.base_dpi
            
        # Limitar DPI máximo para evitar estouro de memória
        max_safe_dpi = 1200
        if dpi > max_safe_dpi:
            print(f"    DPI {dpi} excede limite seguro, usando {max_safe_dpi}")
            dpi = max_safe_dpi
            
        doc = fitz.open(str(self.pdf_path))
        page = doc[page_num]
        
        # Matriz de transformação
        mat = fitz.Matrix(dpi/72.0, dpi/72.0)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Converter para array numpy
        img_data = pix.tobytes("png")
        
        # Desabilitar temporariamente o aviso de decompression bomb
        Image.MAX_IMAGE_PIXELS = None
        img = Image.open(io.BytesIO(img_data))
        img_array = np.array(img)
        
        doc.close()
        return img_array
    
    def calculate_content_density(self, image_region):
        """Calcula densidade de conteúdo em uma região"""
        # Verificar se a região está vazia
        if image_region.size == 0 or image_region.shape[0] == 0 or image_region.shape[1] == 0:
            return 0.0
            
        # Converter para escala de cinza se necessário
        if len(image_region.shape) == 3:
            gray = cv2.cvtColor(image_region, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_region
            
        # Threshold para detectar conteúdo (não-branco)
        _, binary = cv2.threshold(gray, 250, 255, cv2.THRESH_BINARY_INV)
        
        # Calcular porcentagem de pixels com conteúdo
        total_pixels = binary.shape[0] * binary.shape[1]
        content_pixels = np.sum(binary > 0)
        
        if total_pixels == 0:
            return 0.0
            
        density = content_pixels / total_pixels
        return density
    
    def should_subdivide(self, quadrant: QuadrantInfo, image_region):
        """Decide se um quadrante deve ser subdividido"""
        # Não subdividir se já atingiu nível máximo
        if quadrant.level >= self.max_level:
            print(f"    {'  ' * quadrant.level}Não subdividir: nível máximo atingido")
            return False
            
        # Não subdividir se não tem conteúdo suficiente
        if quadrant.content_density < self.density_threshold_for_subdivision:
            print(f"    {'  ' * quadrant.level}Não subdividir: densidade {quadrant.content_density:.1%} < {self.density_threshold_for_subdivision:.1%}")
            return False
            
        # Verificar se há variação de conteúdo (não é uniforme)
        h, w = image_region.shape[:2]
        
        # Dividir em 4 para testar variação
        mid_h, mid_w = h // 2, w // 2
        
        densities = [
            self.calculate_content_density(image_region[:mid_h, :mid_w]),
            self.calculate_content_density(image_region[:mid_h, mid_w:]),
            self.calculate_content_density(image_region[mid_h:, :mid_w]),
            self.calculate_content_density(image_region[mid_h:, mid_w:])
        ]
        
        # Se há variação significativa nas densidades, vale a pena subdividir
        max_density = max(densities)
        min_density = min(densities)
        variation = max_density - min_density
        
        print(f"    {'  ' * quadrant.level}Densidades dos quadrantes: {[f'{d:.1%}' for d in densities]}")
        print(f"    {'  ' * quadrant.level}Variação: {variation:.1%} (min: {min_density:.1%}, max: {max_density:.1%})")
        
        return variation > 0.01  # Reduzir para 1% de variação
    
    def extract_quadrant(self, image, quadrant: QuadrantInfo):
        """Extrai e salva um quadrante"""
        x, y, w, h = quadrant.bbox
        
        # Extrair região
        region = image[y:y+h, x:x+w]
        
        # Gerar nome único baseado na hierarquia
        filename = f"L{quadrant.level}_{quadrant.quadrant_id}.png"
        filepath = self.output_dir / filename
        
        # Salvar imagem
        Image.fromarray(region).save(filepath, "PNG", optimize=False, quality=100)
        
        quadrant.extracted_path = str(filepath)
        
        print(f"  {'  ' * quadrant.level}Extraído: {quadrant.quadrant_id} "
              f"({w}x{h}px, densidade: {quadrant.content_density:.1%})")
        
        return region
    
    def process_quadrant_recursive(self, image, parent_quadrant: QuadrantInfo, 
                                 position: str = "root"):
        """Processa um quadrante recursivamente"""
        x, y, w, h = parent_quadrant.bbox
        
        # Validar e ajustar limites
        img_h, img_w = image.shape[:2]
        x = max(0, min(x, img_w - 1))
        y = max(0, min(y, img_h - 1))
        w = min(w, img_w - x)
        h = min(h, img_h - y)
        
        # Verificar se ainda tem área válida
        if w <= 0 or h <= 0:
            print(f"  {'  ' * parent_quadrant.level}Quadrante {parent_quadrant.quadrant_id}: fora dos limites")
            return
        
        # Atualizar bbox com valores validados
        parent_quadrant.bbox = (x, y, w, h)
        
        # Extrair região do quadrante
        region = image[y:y+h, x:x+w]
        
        # Calcular densidade de conteúdo
        parent_quadrant.content_density = self.calculate_content_density(region)
        parent_quadrant.has_content = parent_quadrant.content_density > self.min_content_density
        
        # Se não tem conteúdo significativo, parar aqui
        if not parent_quadrant.has_content:
            print(f"  {'  ' * parent_quadrant.level}Quadrante {parent_quadrant.quadrant_id}: vazio")
            return
        
        # Extrair este quadrante
        self.extract_quadrant(image, parent_quadrant)
        self.all_quadrants.append(parent_quadrant)
        
        # Decidir se deve subdividir
        if self.should_subdivide(parent_quadrant, region):
            # Criar 4 sub-quadrantes
            mid_w, mid_h = w // 2, h // 2
            
            positions = [
                ("TL", (x, y, mid_w, mid_h)),           # Top-Left
                ("TR", (x + mid_w, y, w - mid_w, mid_h)),  # Top-Right
                ("BL", (x, y + mid_h, mid_w, h - mid_h)),  # Bottom-Left
                ("BR", (x + mid_w, y + mid_h, w - mid_w, h - mid_h))  # Bottom-Right
            ]
            
            for pos_name, (sub_x, sub_y, sub_w, sub_h) in positions:
                child_id = f"{parent_quadrant.quadrant_id}_{pos_name}"
                
                child = QuadrantInfo(
                    level=parent_quadrant.level + 1,
                    parent_id=parent_quadrant.quadrant_id,
                    quadrant_id=child_id,
                    bbox=(sub_x, sub_y, sub_w, sub_h),
                    has_content=False,
                    content_density=0.0
                )
                
                parent_quadrant.children.append(child)
                
                # Processar recursivamente com DPI aumentado
                child_dpi = self.base_dpi * (2 ** child.level)
                
                # Se o nível aumentou, re-extrair com maior resolução
                if child.level > 1:
                    print(f"  {'  ' * parent_quadrant.level}Re-extraindo com {child_dpi} DPI...")
                    high_res_image = self.extract_page_at_dpi(dpi=child_dpi)
                    
                    # Ajustar coordenadas para nova resolução
                    scale = child_dpi / self.base_dpi
                    scaled_bbox = (
                        int(sub_x * scale),
                        int(sub_y * scale),
                        int(sub_w * scale),
                        int(sub_h * scale)
                    )
                    child.bbox = scaled_bbox
                    
                    self.process_quadrant_recursive(high_res_image, child, pos_name)
                else:
                    self.process_quadrant_recursive(image, child, pos_name)
    
    def create_hierarchical_visualization(self):
        """Cria visualização hierárquica dos quadrantes"""
        print("\nCriando visualização hierárquica...")
        
        # Criar imagem base
        base_image = self.extract_page_at_dpi(dpi=150)  # Baixa resolução para visualização
        h, w = base_image.shape[:2]
        
        # Criar cópia para desenhar
        vis_img = base_image.copy()
        
        # Cores por nível
        level_colors = [
            (255, 0, 0),      # Nível 0: Vermelho
            (0, 255, 0),      # Nível 1: Verde
            (0, 0, 255),      # Nível 2: Azul
            (255, 255, 0),    # Nível 3: Amarelo
            (255, 0, 255),    # Nível 4: Magenta
        ]
        
        # Desenhar todos os quadrantes
        for quad in self.all_quadrants:
            if quad.has_content:
                # Ajustar coordenadas para resolução de visualização
                scale = 150 / (self.base_dpi * (2 ** max(0, quad.level - 1)))
                x, y, w, h = quad.bbox
                x, y, w, h = int(x * scale), int(y * scale), int(w * scale), int(h * scale)
                
                color = level_colors[min(quad.level, len(level_colors) - 1)]
                thickness = max(1, 3 - quad.level)
                
                cv2.rectangle(vis_img, (x, y), (x + w, y + h), color, thickness)
                
                # Adicionar label
                label = f"L{quad.level}"
                cv2.putText(vis_img, label, (x + 5, y + 20),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        
        # Salvar visualização
        vis_path = self.output_dir / "00_hierarchical_view.png"
        Image.fromarray(vis_img).save(vis_path)
        
        print(f"  Visualização salva: {vis_path}")
        return str(vis_path)
    
    def create_navigation_html(self):
        """Cria HTML para navegar pela estrutura hierárquica"""
        print("\nCriando navegação HTML...")
        
        html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Miro Progressive Extraction</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f0f0f0;
        }
        .container {
            display: flex;
            gap: 20px;
        }
        .tree-panel {
            width: 300px;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            height: 80vh;
            overflow-y: auto;
        }
        .viewer-panel {
            flex: 1;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .tree-item {
            cursor: pointer;
            padding: 5px;
            margin: 2px 0;
            border-radius: 3px;
        }
        .tree-item:hover {
            background: #e0e0e0;
        }
        .tree-item.selected {
            background: #007bff;
            color: white;
        }
        .level-0 { margin-left: 0px; }
        .level-1 { margin-left: 20px; }
        .level-2 { margin-left: 40px; }
        .level-3 { margin-left: 60px; }
        .density {
            font-size: 0.8em;
            color: #666;
        }
        .selected .density {
            color: #ccc;
        }
        #viewer {
            max-width: 100%;
            border: 2px solid #333;
        }
        .info {
            margin-top: 10px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        h1 {
            color: #333;
        }
        .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 20px;
        }
        .stat-box {
            padding: 10px;
            background: #f0f0f0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Miro Progressive Extraction - Navegação Hierárquica</h1>
    
    <div class="container">
        <div class="tree-panel">
            <h3>Estrutura de Quadrantes</h3>
            <div id="tree">
"""
        
        # Função auxiliar para gerar árvore HTML
        def generate_tree_html(quadrant, html=""):
            if quadrant.has_content:
                density_text = f"{quadrant.content_density:.1%}"
                html += f"""
                <div class="tree-item level-{quadrant.level}" 
                     onclick="showQuadrant('{quadrant.quadrant_id}', '{os.path.basename(quadrant.extracted_path)}')"
                     id="item-{quadrant.quadrant_id}">
                    <strong>{quadrant.quadrant_id}</strong>
                    <span class="density">({density_text})</span>
                </div>
"""
                
                for child in quadrant.children:
                    html = generate_tree_html(child, html)
                    
            return html
        
        # Gerar árvore para cada quadrante raiz
        for quad in self.quadrant_tree:
            html_content += generate_tree_html(quad)
        
        html_content += f"""
            </div>
        </div>
        
        <div class="viewer-panel">
            <h3>Visualização</h3>
            <div class="controls">
                <button onclick="showOverview()">Visão Hierárquica</button>
                <button onclick="showFullPage()">Página Completa</button>
            </div>
            
            <div class="info">
                <div id="current-info">Selecione um quadrante para visualizar</div>
            </div>
            
            <div style="margin-top: 20px;">
                <img id="viewer" src="00_hierarchical_view.png" style="width: 100%;">
            </div>
            
            <div class="stats">
                <div class="stat-box">
                    <strong>Total de Quadrantes:</strong> {len(self.all_quadrants)}
                </div>
                <div class="stat-box">
                    <strong>Níveis Máximos:</strong> {self.max_level}
                </div>
                <div class="stat-box">
                    <strong>DPI Base:</strong> {self.base_dpi}
                </div>
                <div class="stat-box">
                    <strong>DPI Máximo:</strong> {self.base_dpi * (2 ** self.max_level)}
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let currentSelected = null;
        
        function showQuadrant(id, filename) {{
            // Atualizar seleção
            if (currentSelected) {{
                document.getElementById('item-' + currentSelected).classList.remove('selected');
            }}
            document.getElementById('item-' + id).classList.add('selected');
            currentSelected = id;
            
            // Atualizar viewer
            document.getElementById('viewer').src = filename;
            document.getElementById('current-info').innerHTML = 
                '<strong>Visualizando:</strong> ' + id + ' - ' + filename;
        }}
        
        function showOverview() {{
            document.getElementById('viewer').src = '00_hierarchical_view.png';
            document.getElementById('current-info').innerHTML = 
                '<strong>Visualizando:</strong> Visão Hierárquica Completa';
                
            if (currentSelected) {{
                document.getElementById('item-' + currentSelected).classList.remove('selected');
                currentSelected = null;
            }}
        }}
        
        function showFullPage() {{
            document.getElementById('viewer').src = 'L0_root.png';
            document.getElementById('current-info').innerHTML = 
                '<strong>Visualizando:</strong> Página Completa';
                
            if (currentSelected) {{
                document.getElementById('item-' + currentSelected).classList.remove('selected');
                currentSelected = null;
            }}
        }}
    </script>
</body>
</html>
"""
        
        # Salvar HTML
        html_path = self.output_dir / "index.html"
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        print(f"  Navegação HTML salva: {html_path}")
        return str(html_path)
    
    def process(self):
        """Processa o PDF usando abordagem progressiva"""
        print(f"\n=== Extração Progressiva Miro: {self.pdf_path.name} ===")
        print(f"DPI Base: {self.base_dpi}")
        print(f"Nível Máximo: {self.max_level}")
        
        # 1. Extrair página inicial
        print("\nNível 0: Extraindo página completa...")
        base_image = self.extract_page_at_dpi()
        h, w = base_image.shape[:2]
        
        # 2. Criar quadrante raiz
        root_quadrant = QuadrantInfo(
            level=0,
            parent_id="",
            quadrant_id="root",
            bbox=(0, 0, w, h),
            has_content=True,
            content_density=1.0
        )
        
        # 3. Processar recursivamente
        self.process_quadrant_recursive(base_image, root_quadrant)
        self.quadrant_tree.append(root_quadrant)
        
        # 4. Criar visualizações
        hier_path = self.create_hierarchical_visualization()
        html_path = self.create_navigation_html()
        
        # 5. Salvar metadados
        metadata = {
            'pdf_file': str(self.pdf_path),
            'extraction_date': datetime.now().isoformat(),
            'base_dpi': self.base_dpi,
            'max_level': self.max_level,
            'total_quadrants': len(self.all_quadrants),
            'quadrants_with_content': len([q for q in self.all_quadrants if q.has_content]),
            'files': {
                'hierarchical_view': hier_path,
                'navigation': html_path
            }
        }
        
        # Adicionar estatísticas por nível
        level_stats = {}
        for quad in self.all_quadrants:
            level = quad.level
            if level not in level_stats:
                level_stats[level] = {'count': 0, 'avg_density': 0}
            level_stats[level]['count'] += 1
            level_stats[level]['avg_density'] += quad.content_density
            
        for level, stats in level_stats.items():
            stats['avg_density'] /= stats['count']
            
        metadata['level_statistics'] = level_stats
        
        metadata_path = self.output_dir / "extraction_metadata.json"
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"\n=== Extração Progressiva Concluída ===")
        print(f"Total de quadrantes: {len(self.all_quadrants)}")
        print(f"Quadrantes com conteúdo: {len([q for q in self.all_quadrants if q.has_content])}")
        print(f"\nEstatísticas por nível:")
        for level, stats in level_stats.items():
            print(f"  Nível {level}: {stats['count']} quadrantes, "
                  f"densidade média: {stats['avg_density']:.1%}")
        print(f"\nArquivos salvos em: {self.output_dir}")
        print(f"Navegação HTML: {html_path}")
        
        return metadata


def main():
    parser = argparse.ArgumentParser(
        description='Extração progressiva de Miro com abordagem hierárquica',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  # Extração padrão
  python extract_miro_progressive.py protocolo_miro.pdf
  
  # Com DPI base customizado
  python extract_miro_progressive.py protocolo.pdf --dpi 600
  
  # Com profundidade máxima customizada
  python extract_miro_progressive.py protocolo.pdf --max-level 4
        """
    )
    
    parser.add_argument('pdf_file', help='Arquivo PDF do Miro para processar')
    parser.add_argument('--output', help='Diretório de saída')
    parser.add_argument('--dpi', type=int, default=300,
                       help='DPI base (será multiplicado por 2 a cada nível)')
    parser.add_argument('--max-level', type=int, default=3,
                       help='Nível máximo de subdivisão (padrão: 3)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.pdf_file):
        print(f"Erro: Arquivo não encontrado: {args.pdf_file}")
        sys.exit(1)
    
    # Processar
    extractor = MiroProgressiveExtractor(
        args.pdf_file, 
        args.output,
        args.dpi,
        args.max_level
    )
    extractor.process()


if __name__ == "__main__":
    main()