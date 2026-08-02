"""Précontrôle d'accessibilité du PDF.

Vérifie les propriétés contrôlables localement : balisage actif, PDF 2.0,
présence d'une alternative par élément graphique et absence d'avertissement de
balisage dans le journal LaTeX. Ce contrôle ne remplace pas une validation
PDF/UA avec veraPDF ou PAC.
"""
import glob
import os
import re
import subprocess
import sys
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
DOC = os.path.abspath(os.path.join(HERE, '..'))
PDF = os.path.join(DOC, 'regression_logistique.pdf')
LOG = os.path.join(DOC, 'regression_logistique.log')


def alt_count(path):
    data = open(path, 'rb').read()
    total = len(re.findall(rb'/Alt', data))
    for m in re.finditer(rb'stream\r?\n', data):
        start = m.end()
        end = data.find(b'endstream', start)
        try:
            total += len(re.findall(rb'/Alt', zlib.decompress(data[start:end])))
        except zlib.error:
            pass
    return total


def graphic_count():
    """Compte les éléments graphiques qui doivent chacun porter un /Alt."""
    tikz = images = 0
    for source in glob.glob(os.path.join(DOC, 'chapters', '*.tex')):
        text = open(source, encoding='utf-8').read()
        tikz += len(re.findall(r'\\begin\{tikzpicture\}', text))
        images += len(re.findall(r'\\includegraphics(?:\[[^\]]*\])?\{', text))
    return tikz + images


def tagging_warnings():
    if not os.path.exists(LOG):
        return ['journal LaTeX absent']
    text = open(LOG, encoding='utf-8', errors='replace').read()
    return re.findall(r'Package tagpdf Warning:[^\n]*', text)


def main():
    if not os.path.exists(PDF):
        sys.exit('PDF absent : lancer make -C docs doc')
    info = subprocess.run(['pdfinfo', PDF], capture_output=True, text=True).stdout
    tagged = re.search(r'^Tagged:\s+(\S+)', info, re.M).group(1)
    version = re.search(r'^PDF version:\s+(\S+)', info, re.M).group(1)
    graphics, alts = graphic_count(), alt_count(PDF)
    warnings = tagging_warnings()

    print(f"balisage           {tagged}")
    print(f"version PDF        {version}")
    print(f"graphiques sources {graphics}")
    print(f"entrées /Alt       {alts}")
    print(f"alertes tagpdf     {len(warnings)}")

    if tagged != 'yes':
        sys.exit('PDF non balisé')
    if version != '2.0':
        sys.exit(f'version PDF inattendue : {version}')
    if alts < graphics:
        sys.exit(f'{graphics - alts} graphique(s) sans alternative textuelle')
    if warnings:
        sys.exit(f'{len(warnings)} avertissement(s) tagpdf dans le journal')
    print('précontrôle réussi : balisage actif et alternatives présentes')


if __name__ == '__main__':
    main()
