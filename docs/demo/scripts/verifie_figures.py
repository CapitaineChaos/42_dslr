#!/usr/bin/env python3
"""Contrôle des figures de l'atelier dans un vrai navigateur.

Les deux figures en relief sont des scènes WebGL : ni un test de module ni une
lecture du DOM ne disent si elles se sont construites. Le script sert le dossier,
ouvre la page, agrandit chaque carte, tourne les scènes, change d'itération, et
échoue si la console rapporte une erreur ou si une scène reste vide.

    pip install playwright        # hors requirements.txt : lourd, et jamais
                                  # nécessaire pour se servir de l'atelier
    python3 docs/demo/scripts/verifie_figures.py [--images DOSSIER]

En rendu logiciel — machine sans GPU, intégration continue — le coût d'un cran
est plusieurs fois celui d'une machine de bureau : le chiffre affiché sert à
comparer deux versions sur la même machine, pas à juger d'une fluidité.
"""

from __future__ import annotations

import argparse
import http.server
import socket
import socketserver
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parents[1]
RELIEFS = ["surface", "chemin"]
PLOTS = ["frontiere", "scores", "sigmoide", "surface", "perte", "chemin", "roc"]

# Vingt crans d'itération enchaînés, sans laisser au navigateur le temps de
# souffler entre deux.
CRANS = """
  () => {
    const slider = document.querySelector('input[type=range]');
    const start = performance.now();
    for (let i = 1; i <= 20; i += 1) {
      slider.value = String(i * 5);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return (performance.now() - start) / 20;
  }
"""


def serve(directory: Path) -> tuple[str, socketserver.TCPServer]:
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(directory), **kwargs)

        def log_message(self, *args):
            pass

    httpd = socketserver.TCPServer(("127.0.0.1", port), Handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{port}", httpd


def turn(page, key):
    """Un glissement sur la scène : l'orientation doit changer et rester."""
    box = page.locator(f'[data-canvas="{key}"]').bounding_box()
    middle = (box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
    page.mouse.move(*middle)
    page.mouse.down()
    page.mouse.move(middle[0] + 120, middle[1] - 50, steps=10)
    page.mouse.up()
    page.wait_for_timeout(800)
    return page.evaluate(f"document.querySelector('[data-canvas={key}]')._fullLayout.scene.camera.eye")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--images", type=Path, help="dossier où déposer les captures")
    options = parser.parse_args()

    base, httpd = serve(HERE)
    faults: list[str] = []

    with sync_playwright() as play:
        browser = play.chromium.launch(
            channel="chrome",
            args=["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        page = browser.new_page(viewport={"width": 1400, "height": 900})
        page.on("pageerror", lambda error: faults.append(f"exception : {error}"))
        # Les échecs de chargement passent par le contrôle réseau : la console
        # les rapporte sans dire quelle adresse, et le favicon que le navigateur
        # réclame de lui-même en fait partie.
        page.on("console", lambda message: faults.append(f"console : {message.text}")
                if message.type == "error" and "Failed to load resource" not in message.text else None)
        page.on("response", lambda answer: faults.append(f"réseau : {answer.status} {answer.url}")
                if answer.status >= 400 and not answer.url.endswith("favicon.ico") else None)

        page.goto(f"{base}/index.html", wait_until="load")
        page.wait_for_timeout(4000)

        for key in RELIEFS:
            if page.locator(f'[data-canvas="{key}"] canvas').count() == 0:
                faults.append(f"{key} : scène vide en vignette")

        print("mosaïque : %.0f ms par cran" % page.evaluate(CRANS))

        for key in PLOTS:
            page.locator(f'[data-plot="{key}"]').click()
            page.wait_for_timeout(2500 if key in RELIEFS else 400)
            if key in RELIEFS:
                start = page.evaluate(f"document.querySelector('[data-canvas={key}]')._fullLayout.scene.camera.eye")
                turned = turn(page, key)
                if turned == start:
                    faults.append(f"{key} : le glissement n'a pas tourné la scène")
                page.evaluate(CRANS)
                page.wait_for_timeout(800)
                after = page.evaluate(f"document.querySelector('[data-canvas={key}]')._fullLayout.scene.camera.eye")
                if turned != after:
                    faults.append(f"{key} : l'orientation n'a pas survécu au changement d'itération")
                print("%s agrandie : %.0f ms par cran" % (key, page.evaluate(CRANS)))
            if options.images:
                options.images.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(options.images / f"{key}.png"))
            page.locator("#plots-close").click()
            page.wait_for_timeout(300)

        # Notes brutes : autres bornes, autre relief, mêmes figures.
        page.goto(f"{base}/index.html?brut=1", wait_until="load")
        page.wait_for_timeout(3500)
        for key in RELIEFS:
            if page.locator(f'[data-canvas="{key}"] canvas').count() == 0:
                faults.append(f"{key} : scène vide sur les notes brutes")

        browser.close()

    httpd.shutdown()
    for line in faults:
        print("ÉCHEC", line, file=sys.stderr)
    print("aucun défaut" if not faults else f"{len(faults)} défauts")
    return 1 if faults else 0


if __name__ == "__main__":
    raise SystemExit(main())
