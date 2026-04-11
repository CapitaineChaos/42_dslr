#!/usr/bin/env python3
"""
md_to_pdf.py — Convertit un fichier Markdown en PDF via Google Chrome headless.

Dépendances : google-chrome (installé), pas de pip requis.
Rendu des équations : KaTeX ($$...$$ et $...$).
Rendu Markdown     : marked.js.
Les deux librairies sont chargées depuis un CDN (connexion internet requise).

Usage :
    ./scripts/md_to_pdf.py <input.md> [output.pdf]

Exemples :
    ./scripts/md_to_pdf.py V.1_Data_Analysis/README.md
    ./scripts/md_to_pdf.py V.1_Data_Analysis/README.md /tmp/stats.pdf
"""

import sys
import os
import tempfile
import subprocess

# ── Arguments ────────────────────────────────────────────────────────────────

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(1)

input_md  = sys.argv[1]
output_pdf = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(input_md)[0] + ".pdf"

if not os.path.isfile(input_md):
    print(f"Erreur : fichier introuvable : {input_md}", file=sys.stderr)
    sys.exit(1)

# ── Lecture du markdown ───────────────────────────────────────────────────────

with open(input_md, "r", encoding="utf-8") as f:
    md_raw = f.read()

# Échapper pour l'intégration dans un template literal JavaScript :
#   \  →  \\   (backslash d'abord pour ne pas double-échapper)
#   `  →  \`   (délimiteur du template literal)
#   ${ →  \${  (interpolation JS, ex: ${variable})
md_js = md_raw.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

title = os.path.basename(input_md)

# ── Template HTML ─────────────────────────────────────────────────────────────
# On n'utilise PAS de f-string pour le corps HTML (trop de { } CSS/JS à échapper).
# On injecte uniquement les deux variables dynamiques via .replace().

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>__TITLE__</title>

  <!-- KaTeX -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$',  right: '$',  display: false}
      ],
      throwOnError: false
    });"></script>

  <!-- marked.js -->
  <script src="https://cdn.jsdelivr.net/npm/marked@12/marked.min.js"></script>

  <style>
    body {
      font-family: "Linux Libertine", Georgia, "Times New Roman", serif;
      max-width: 820px;
      margin: 40px auto;
      padding: 0 24px;
      font-size: 13.5px;
      line-height: 1.65;
      color: #1a1a1a;
    }
    h1 { font-size: 1.9em; border-bottom: 2px solid #222; padding-bottom: 6px; margin-top: 1.2em; }
    h2 { font-size: 1.45em; border-bottom: 1px solid #bbb; padding-bottom: 4px; margin-top: 2.2em; }
    h3 { font-size: 1.15em; margin-top: 1.8em; }
    h4 { font-size: 1em; font-style: italic; margin-top: 1.4em; }
    p  { margin: 0.6em 0; }
    ul, ol { margin: 0.5em 0; padding-left: 1.8em; }
    li { margin: 0.25em 0; }
    table {
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 0.91em;
    }
    th, td { border: 1px solid #bbb; padding: 4px 11px; }
    th { background: #f0f0f0; font-weight: 600; }
    code {
      background: #f4f4f4;
      padding: 1px 5px;
      border-radius: 3px;
      font-family: "DejaVu Sans Mono", monospace;
      font-size: 0.88em;
    }
    pre {
      background: #f4f4f4;
      padding: 12px 16px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code { background: none; padding: 0; }
    blockquote {
      border-left: 3px solid #aaa;
      margin: 0.8em 0 0.8em 0;
      padding-left: 1.2em;
      color: #555;
    }
    hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
    .katex-display { overflow-x: auto; margin: 1em 0; }
    strong { font-weight: 700; }
    @media print {
      body { margin: 0; }
      h2   { page-break-before: auto; }
    }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    const md = `__MD_CONTENT__`;
    document.getElementById("content").innerHTML = marked.parse(md);
  </script>
</body>
</html>
"""

html = HTML_TEMPLATE.replace("__TITLE__", title).replace("__MD_CONTENT__", md_js)

# ── Écriture du HTML temporaire ───────────────────────────────────────────────

tmp = tempfile.NamedTemporaryFile(suffix=".html", mode="w", encoding="utf-8", delete=False)
tmp.write(html)
tmp.flush()
tmp.close()
tmp_path = tmp.name

# ── Conversion via Chrome headless ────────────────────────────────────────────

output_abs = os.path.abspath(output_pdf)
file_url   = f"file://{tmp_path}"

cmd = [
    "google-chrome",
    "--headless=new",          # nouveau moteur headless (Chrome >= 112)
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--run-all-compositors",
    "--virtual-time-budget=6000",   # laisse 6 s au JS (marked + KaTeX) pour s'exécuter
    f"--print-to-pdf={output_abs}",
    "--no-pdf-header-footer",        # pas d'en-tête/pied Chrome (URL, date, etc.)
    file_url,
]

print(f"Conversion : {input_md}  →  {output_pdf}")
result = subprocess.run(cmd, capture_output=True, text=True)

os.unlink(tmp_path)

if result.returncode == 0:
    size_kb = os.path.getsize(output_abs) // 1024
    print(f"Succès — {output_pdf} ({size_kb} Ko)")
else:
    print("Erreur Chrome :", file=sys.stderr)
    print(result.stderr[:800], file=sys.stderr)
    sys.exit(1)
