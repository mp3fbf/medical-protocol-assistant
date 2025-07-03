#!/usr/bin/env python3

import os
from pdf2image import convert_from_path
from PIL import Image
import sys

def extract_pdf_pages(pdf_path, output_folder, dpi=300):
    """
    Extrai todas as páginas de um PDF em alta resolução
    """
    if not os.path.exists(pdf_path):
        print(f"Erro: PDF não encontrado - {pdf_path}")
        return []
    
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    pdf_output_folder = os.path.join(output_folder, pdf_name.replace(" ", "_"))
    os.makedirs(pdf_output_folder, exist_ok=True)
    
    print(f"\nProcessando: {pdf_name}")
    print(f"Extraindo com {dpi} DPI...")
    
    try:
        # Converter PDF em imagens com alta resolução
        pages = convert_from_path(pdf_path, dpi=dpi)
        extracted_files = []
        
        for i, page in enumerate(pages):
            # Salvar página em alta resolução
            page_num = i + 1
            filename = f"{pdf_name}_page_{page_num:03d}.png"
            filepath = os.path.join(pdf_output_folder, filename)
            
            # Salvar como PNG sem compressão para máxima qualidade
            page.save(filepath, 'PNG', optimize=False, quality=100)
            extracted_files.append(filepath)
            
            # Verificar se a página contém fluxograma (baseado no tamanho/proporção)
            width, height = page.size
            if width > height * 1.3 or height > width * 1.3:
                # Página com proporção que sugere fluxograma
                print(f"  Página {page_num}: Possível fluxograma detectado (dimensões: {width}x{height})")
                
                # Criar versão com zoom extra para fluxogramas
                zoom_filename = f"{pdf_name}_page_{page_num:03d}_zoom.png"
                zoom_filepath = os.path.join(pdf_output_folder, zoom_filename)
                
                # Aplicar zoom de 2x para fluxogramas
                zoomed = page.resize((width * 2, height * 2), Image.Resampling.LANCZOS)
                zoomed.save(zoom_filepath, 'PNG', optimize=False, quality=100)
                extracted_files.append(zoom_filepath)
                print(f"    → Versão com zoom salva: {zoom_filename}")
            else:
                print(f"  Página {page_num}: Extraída (dimensões: {width}x{height})")
        
        print(f"Total de arquivos extraídos: {len(extracted_files)}")
        return extracted_files
        
    except Exception as e:
        print(f"Erro ao processar {pdf_name}: {str(e)}")
        return []

def main():
    # PDFs para processar
    pdfs = [
        "/Users/robertocunha/Documents/protocolos/DAK-39 - Dor Torácica/[Prevent] Dor torácica PS.pdf",
        "/Users/robertocunha/Documents/protocolos/DAK-39 - Dor Torácica/DAK 39 - Protocolo dor toracica.docx.pdf",
        "/Users/robertocunha/Documents/protocolos/DAK-39 - Dor Torácica/Daktus-DAK-39.pdf"
    ]
    
    output_folder = "/Users/robertocunha/Documents/protocolos/DAK-39 - Dor Torácica/pdf_images"
    all_extracted_files = []
    
    print("=== Extração de PDFs em Alta Resolução ===")
    print(f"Diretório de saída: {output_folder}")
    
    for pdf_path in pdfs:
        files = extract_pdf_pages(pdf_path, output_folder, dpi=300)
        all_extracted_files.extend(files)
    
    print("\n=== Resumo da Extração ===")
    print(f"Total de imagens extraídas: {len(all_extracted_files)}")
    print("\nCaminhos completos das imagens:")
    for filepath in all_extracted_files:
        print(f"  {filepath}")

if __name__ == "__main__":
    main()