#!/usr/bin/env python3

import os
import sys
import PyPDF2
from pdfplumber import PDF
import tiktoken

def extract_text_from_pdf(pdf_path):
    """
    Extract text from PDF using multiple methods for better accuracy
    """
    text = ""
    
    # Method 1: Try pdfplumber first (usually better for complex layouts)
    try:
        with PDF.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"pdfplumber error: {e}")
    
    # Method 2: If pdfplumber fails or gets little text, try PyPDF2
    if len(text) < 100:
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"PyPDF2 error: {e}")
    
    return text

def count_tokens(text, model="gpt-4"):
    """
    Count tokens using tiktoken (OpenAI's token counter)
    """
    try:
        encoding = tiktoken.encoding_for_model(model)
        tokens = encoding.encode(text)
        return len(tokens)
    except:
        # Fallback to cl100k_base encoding
        encoding = tiktoken.get_encoding("cl100k_base")
        tokens = encoding.encode(text)
        return len(tokens)

def analyze_pdf(pdf_path):
    """
    Analyze a PDF and return statistics
    """
    print(f"\n{'='*60}")
    print(f"Analyzing: {os.path.basename(pdf_path)}")
    print(f"{'='*60}")
    
    if not os.path.exists(pdf_path):
        print(f"Error: File not found - {pdf_path}")
        return None
    
    # Extract text
    text = extract_text_from_pdf(pdf_path)
    
    if not text:
        print("Error: Could not extract text from PDF")
        return None
    
    # Calculate statistics
    char_count = len(text)
    word_count = len(text.split())
    line_count = len(text.splitlines())
    
    # Count tokens
    token_count = count_tokens(text)
    
    # Calculate estimates
    tokens_by_chars = char_count / 4  # 1 token ≈ 4 characters
    tokens_by_words = word_count / 0.75  # 1 token ≈ 0.75 words
    
    results = {
        'filename': os.path.basename(pdf_path),
        'characters': char_count,
        'words': word_count,
        'lines': line_count,
        'tokens_actual': token_count,
        'tokens_est_chars': int(tokens_by_chars),
        'tokens_est_words': int(tokens_by_words),
        'text_preview': text[:500] + "..." if len(text) > 500 else text
    }
    
    # Print results
    print(f"Characters: {char_count:,}")
    print(f"Words: {word_count:,}")
    print(f"Lines: {line_count:,}")
    print(f"\nToken Counts:")
    print(f"  - Actual (tiktoken): {token_count:,}")
    print(f"  - Estimate (chars/4): {int(tokens_by_chars):,}")
    print(f"  - Estimate (words/0.75): {int(tokens_by_words):,}")
    print(f"\nText Preview (first 500 chars):")
    print("-" * 40)
    print(results['text_preview'])
    
    return results

def main():
    # PDFs to analyze
    pdfs = [
        "/Users/robertocunha/Documents/protocolos/DAK-39 - Dor Torácica/DAK 39 - Protocolo dor toracica.docx.pdf",
        "/Users/robertocunha/Documents/protocolos/DAK-39 - Dor Torácica/Daktus-DAK-39.pdf"
    ]
    
    results = []
    
    for pdf_path in pdfs:
        result = analyze_pdf(pdf_path)
        if result:
            results.append(result)
    
    # Comparison
    if len(results) == 2:
        print(f"\n{'='*60}")
        print("COMPARISON SUMMARY")
        print(f"{'='*60}")
        
        print(f"\n{'Document':<40} {'Characters':>12} {'Words':>12} {'Tokens':>12}")
        print("-" * 80)
        
        for r in results:
            name = r['filename'][:38] + ".." if len(r['filename']) > 40 else r['filename']
            print(f"{name:<40} {r['characters']:>12,} {r['words']:>12,} {r['tokens_actual']:>12,}")
        
        # Calculate differences
        char_diff = results[0]['characters'] - results[1]['characters']
        word_diff = results[0]['words'] - results[1]['words']
        token_diff = results[0]['tokens_actual'] - results[1]['tokens_actual']
        
        print(f"\n{'Difference':<40} {char_diff:>12,} {word_diff:>12,} {token_diff:>12,}")
        
        # Percentage differences
        if results[1]['characters'] > 0:
            char_pct = (char_diff / results[1]['characters']) * 100
            word_pct = (word_diff / results[1]['words']) * 100 if results[1]['words'] > 0 else 0
            token_pct = (token_diff / results[1]['tokens_actual']) * 100 if results[1]['tokens_actual'] > 0 else 0
            
            print(f"{'Percentage diff':<40} {char_pct:>11.1f}% {word_pct:>11.1f}% {token_pct:>11.1f}%")

if __name__ == "__main__":
    main()