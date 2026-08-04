#!/usr/bin/env python3
"""Assemble le diaporama du micro-cas sans recopier les valeurs calculées.

``construire_cas.py`` transforme d'abord le CSV source en macros LaTeX.
Ce script garde volontairement un rôle minuscule : il contrôle la structure du
contenu éditorial, puis produit le corps inclus par le thème Beamer.
"""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALUES = ROOT / "valeurs.tex"
CONTENT = ROOT / "contenu.tex"
OUTPUT = ROOT / "corps.tex"

STAGES = (
    "Données",
    "Score linéaire",
    "Sigmoïde",
    "Perte logistique",
    "Gradient",
    "Mise à jour",
    "Décision",
    "Évaluation",
)

FORBIDDEN = (
    "Hogwarts",
    "Gryffindor",
    "Hufflepuff",
    "Ravenclaw",
    "Slytherin",
    "Herbology",
    "Ancient Runes",
    "un-contre-tous",
    "1 600",
    "1600",
    "Lycée des Rives",
    "Lycée des Aulnes",
    "Excel",
    "LibreOffice",
    "tableur",
    ".csv",
)


def validate(content: str) -> None:
    """Refuse une structure qui pourrait désynchroniser le parcours visuel."""

    if not VALUES.exists():
        raise SystemExit(
            f"{VALUES.name} absent : exécuter scripts/construire_cas.py d'abord"
        )

    parts = re.findall(r"\\coursepart\{([^{}]+)\}\{([^{}]+)\}\{([^{}]+)\}", content)
    short_names = tuple(short for _title, short, _color in parts)
    if short_names != STAGES:
        raise SystemExit(
            "les huit coursepart doivent suivre exactement le parcours : "
            + " -> ".join(STAGES)
        )

    if content.count(r"\courseintro") != 1:
        raise SystemExit("le contenu doit comporter un unique \\courseintro")

    introduction = content.split(r"\coursepart", maxsplit=1)[0]
    premature_labels = (r"\widehat y", r"y_i", "$y$", "y=0", "y=1")
    if any(token in introduction for token in premature_labels):
        raise SystemExit("le codage numérique de la maison apparaît dans l'introduction")

    lowered = content.casefold()
    found = [word for word in FORBIDDEN if word.casefold() in lowered]
    if found:
        raise SystemExit("vocabulaire de l'ancien cas détecté : " + ", ".join(found))

    manual_stage = re.search(r"(?:étape|etape)\s*\d+\s*/\s*\d+", content, re.I)
    if manual_stage:
        raise SystemExit(
            "numérotation d'étape écrite à la main détectée : " + manual_stage.group(0)
        )


def main() -> None:
    content = CONTENT.read_text(encoding="utf-8")
    validate(content)
    assembled = (
        "% Fichier généré par scripts/assembler_corps.py.\n"
        "% Les nombres viennent exclusivement de data/eleves.csv.\n"
        "\\input{valeurs.tex}\n"
        "\\input{contenu.tex}\n"
    )
    OUTPUT.write_text(assembled, encoding="utf-8")
    print(f"{OUTPUT}: corps assemblé ({len(STAGES)} étapes)")


if __name__ == "__main__":
    main()
