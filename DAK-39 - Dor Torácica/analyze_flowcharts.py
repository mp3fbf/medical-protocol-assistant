#!/usr/bin/env python3

import os
from PIL import Image

def analyze_images(base_folder):
    """
    Analisa as imagens extraídas e identifica potenciais fluxogramas
    """
    print("=== Análise de Imagens Extraídas ===\n")
    
    flowchart_candidates = []
    
    for pdf_folder in os.listdir(base_folder):
        if not os.path.isdir(os.path.join(base_folder, pdf_folder)):
            continue
            
        print(f"PDF: {pdf_folder}")
        pdf_path = os.path.join(base_folder, pdf_folder)
        
        # Analisar apenas imagens com zoom (melhores para fluxogramas)
        zoom_images = [f for f in os.listdir(pdf_path) if f.endswith('_zoom.png')]
        
        for img_file in sorted(zoom_images):
            img_path = os.path.join(pdf_path, img_file)
            
            # Abrir imagem para análise
            try:
                img = Image.open(img_path)
                width, height = img.size
                
                # Calcular proporção
                aspect_ratio = width / height
                
                # Critérios para identificar fluxogramas
                is_landscape = aspect_ratio > 1.3
                is_portrait_flowchart = aspect_ratio < 0.77 and height > 3000
                
                if is_landscape:
                    print(f"  → {img_file} - FLUXOGRAMA HORIZONTAL (landscape) - {width}x{height}")
                    flowchart_candidates.append(img_path)
                elif is_portrait_flowchart:
                    print(f"  → {img_file} - FLUXOGRAMA VERTICAL (portrait) - {width}x{height}")
                    flowchart_candidates.append(img_path)
                else:
                    print(f"  → {img_file} - Página normal - {width}x{height}")
                    
            except Exception as e:
                print(f"  Erro ao analisar {img_file}: {e}")
        
        print()
    
    print("\n=== Fluxogramas Identificados ===")
    print(f"Total de prováveis fluxogramas: {len(flowchart_candidates)}")
    
    print("\nCaminhos completos dos fluxogramas:")
    for path in flowchart_candidates:
        print(f"  {path}")
    
    return flowchart_candidates

if __name__ == "__main__":
    base_folder = "/Users/robertocunha/Documents/protocolos/DAK-39 - Dor Torácica/pdf_images"
    analyze_images(base_folder)