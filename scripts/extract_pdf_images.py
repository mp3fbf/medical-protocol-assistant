#!/usr/bin/env python3
"""
Script genérico para extrair páginas de PDFs como imagens de alta resolução.
Utilizado para análise visual de protocolos médicos.

Uso:
    python extract_pdf_images.py arquivo1.pdf arquivo2.pdf ...
    python extract_pdf_images.py "pasta/*.pdf"
    python extract_pdf_images.py --dpi 400 arquivo.pdf
"""

import os
import sys
import argparse
import glob
from pdf2image import convert_from_path
from PIL import Image
from pathlib import Path


def extract_pdf_pages(pdf_path, output_base_folder=None, dpi=300, zoom_pages=None):
    """
    Extrai todas as páginas de um PDF em alta resolução
    
    Args:
        pdf_path: Caminho do arquivo PDF
        output_base_folder: Pasta base para saída (padrão: pdf_images na pasta do PDF)
        dpi: Resolução de extração (padrão: 300)
        zoom_pages: Lista de números de páginas para aplicar zoom (ex: [1, 3, 5])
    
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
            # Ou usar detecção automática por proporção
            elif width > height * 1.3 or height > width * 1.3:
                should_zoom = True
                print(f"  Página {page_num}: Possível fluxograma detectado (dimensões: {width}x{height})")
            else:
                print(f"  Página {page_num}: Extraída (dimensões: {width}x{height})")
            
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
        description='Extrai páginas de PDFs como imagens de alta resolução',
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
        """
    )
    
    parser.add_argument('pdfs', nargs='+', help='Arquivos PDF para processar (suporta wildcards)')
    parser.add_argument('--dpi', type=int, default=300, help='Resolução de extração em DPI (padrão: 300)')
    parser.add_argument('--output', help='Pasta base para saída (padrão: pdf_images na pasta do PDF)')
    parser.add_argument('--zoom-pages', help='Páginas específicas para aplicar zoom (ex: 1,3,5-7)', default='')
    
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
    
    print(f"=== Extração de PDFs em Alta Resolução ===")
    print(f"PDFs encontrados: {len(all_pdfs)}")
    print(f"Resolução: {args.dpi} DPI")
    
    all_extracted_files = []
    
    for pdf_path in all_pdfs:
        files = extract_pdf_pages(pdf_path, args.output, args.dpi, zoom_pages if zoom_pages else None)
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