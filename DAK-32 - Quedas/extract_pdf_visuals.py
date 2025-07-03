#!/usr/bin/env python3
"""
Script to extract visual elements from PDF files for analysis
"""

import os
import sys
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image
import io

def extract_pdf_pages_as_images(pdf_path, output_dir, dpi=300):
    """Extract all pages from a PDF as high-quality images"""
    
    # Create output directory
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    # Open PDF
    doc = fitz.open(pdf_path)
    pdf_name = Path(pdf_path).stem
    
    print(f"\nProcessing: {pdf_name}")
    print(f"Total pages: {len(doc)}")
    
    extracted_images = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Convert to pixmap with high DPI
        mat = fitz.Matrix(dpi/72.0, dpi/72.0)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert to PIL Image
        img_data = pix.pil_tobytes(format="PNG")
        img = Image.open(io.BytesIO(img_data))
        
        # Save image
        img_path = output_dir / f"{pdf_name}_page_{page_num + 1}.png"
        img.save(img_path, "PNG", optimize=True)
        
        extracted_images.append(img_path)
        
        # Get page text for context
        text = page.get_text()
        
        # Check for visual elements
        drawings = page.get_drawings()
        images = page.get_images()
        
        print(f"\nPage {page_num + 1}:")
        print(f"  - Contains {len(drawings)} drawing objects")
        print(f"  - Contains {len(images)} embedded images")
        print(f"  - Text preview: {text[:100]}..." if text else "  - No text content")
        
        # Extract any embedded images
        for img_index, img_info in enumerate(images):
            xref = img_info[0]
            pix = fitz.Pixmap(doc, xref)
            
            if pix.n - pix.alpha < 4:  # GRAY or RGB
                embedded_img_path = output_dir / f"{pdf_name}_page_{page_num + 1}_img_{img_index + 1}.png"
                pix.save(str(embedded_img_path))
                print(f"  - Extracted embedded image: {embedded_img_path.name}")
            
            pix = None
    
    doc.close()
    return extracted_images

def main():
    # PDF files to analyze
    pdf_files = [
        "/Users/robertocunha/Documents/protocolos/DAK-32 - Quedas/Daktus-DAK-32.pdf",
        "/Users/robertocunha/Documents/protocolos/DAK-32 - Quedas/Estrutura_Protocolo_Quedas.docx.pdf",
        "/Users/robertocunha/Documents/protocolos/DAK-32 - Quedas/Estrutura_Protocolos_Quedas - PS.pdf",
        "/Users/robertocunha/Documents/protocolos/DAK-32 - Quedas/Fluxograma Quedas.pdf"
    ]
    
    output_base_dir = Path("/Users/robertocunha/Documents/protocolos/DAK-32 - Quedas/visual_analysis")
    output_base_dir.mkdir(exist_ok=True)
    
    for pdf_path in pdf_files:
        if os.path.exists(pdf_path):
            pdf_name = Path(pdf_path).stem
            output_dir = output_base_dir / pdf_name
            extract_pdf_pages_as_images(pdf_path, output_dir)
        else:
            print(f"File not found: {pdf_path}")

if __name__ == "__main__":
    main()