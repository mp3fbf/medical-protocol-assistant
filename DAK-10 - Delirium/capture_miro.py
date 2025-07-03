#!/usr/bin/env python3
"""
Script para capturar o fluxograma do Miro do protocolo de Delirium
"""
import time
from playwright.sync_api import sync_playwright

def capture_miro():
    with sync_playwright() as p:
        print("Iniciando navegador...")
        browser = p.chromium.launch(headless=False)
        
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        
        print("Navegando para o Miro...")
        page.goto("https://miro.com/app/board/uXjVIObKXr0=/")
        
        # Aguardar carregamento
        print("Aguardando carregamento do board...")
        page.wait_for_timeout(10000)  # 10 segundos
        
        # Capturar screenshot
        print("Capturando screenshot...")
        page.screenshot(path="miro_screenshots/miro_delirium_full.png", full_page=True)
        
        print("Screenshot salvo em miro_screenshots/miro_delirium_full.png")
        
        # Manter aberto por alguns segundos para verificação
        time.sleep(5)
        
        browser.close()
        print("Concluído!")

if __name__ == "__main__":
    capture_miro()