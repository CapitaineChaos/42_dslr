#!/usr/bin/env python3
"""Produit le corps Beamer à partir des chapitres du cours long.

Le texte long reste la source de vérité. Chaque section ou sous-section devient
une notion de diaporama ; Beamer peut ensuite la poursuivre sur plusieurs vues.
Les figures et tableaux commencent toujours une nouvelle vue.
"""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "regression_logistique_slides_body.tex"

PARTS = (
    (
        "Repères avant le cours",
        "reperes",
        (
            "p0_contrat",
            "p0_probleme",
        ),
    ),
    (
        "Modèle et interprétation",
        "main",
        (
            "p1_standardisation",
            "p1_nuage",
            "p1_probabilite",
            "p1_erreur",
            "p1_descente",
            "p1_modele",
            "p1_classifieur",
        ),
    ),
    (
        "Implémentation et évaluation",
        "continue",
        (
            "p2_donnees",
            "p2_entrainer",
            "p2_predire",
        ),
    ),
    (
        "Fondements, démonstrations et compléments",
        "appendices",
        (
            "annexe_notation",
            "annexe_prerequis",
            "p3_logit",
            "p3_sigmoide",
            "p3_cout",
            "p3_gradient",
            "p3_convexite",
            "annexe_norme",
            "annexe_optimisation",
            "p3_stabilite",
            "annexe_geometrie",
            "annexe_corriges",
        ),
    ),
)


def balanced_argument(source: str, position: int) -> tuple[str, int]:
    while position < len(source) and source[position].isspace():
        position += 1
    if position >= len(source) or source[position] != "{":
        raise ValueError(f"argument attendu à la position {position}")

    depth = 1
    start = position + 1
    position += 1
    while position < len(source) and depth:
        char = source[position]
        escaped = position > 0 and source[position - 1] == "\\"
        if char == "{" and not escaped:
            depth += 1
        elif char == "}" and not escaped:
            depth -= 1
        position += 1
    if depth:
        raise ValueError("accolades non équilibrées")
    return source[start : position - 1], position


def command_arguments(
    source: str, start: int, name: str, count: int
) -> tuple[list[str], int]:
    position = start + len(name) + 1
    if position < len(source) and source[position] == "*":
        position += 1
    arguments: list[str] = []
    for _ in range(count):
        argument, position = balanced_argument(source, position)
        arguments.append(argument)
    return arguments, position


def significant(source: str) -> bool:
    without_comments = re.sub(r"(?m)%.*$", "", source)
    without_labels = re.sub(r"\\label\{[^}]+\}", "", without_comments)
    return bool(without_labels.strip())


def normalize_chunk(source: str) -> str:
    source = re.sub(r"(?m)^\\(?:FloatBarrier|clearpage|newpage)\s*$", "", source)
    source = re.sub(r"\\begin\{figure\}\[[^]]*]", r"\\begin{figure}", source)
    source = re.sub(r"\\begin\{table\}\[[^]]*]", r"\\begin{table}", source)

    visual = re.compile(r"\\begin\{(?:figure|table)\}")
    output: list[str] = []
    cursor = 0
    since_break = ""
    for match in visual.finditer(source):
        prefix = source[cursor : match.start()]
        output.append(prefix)
        since_break += prefix
        if significant(since_break):
            output.append("\n\\framebreak\n")
            since_break = ""
        token = match.group(0)
        output.append(token)
        since_break += token
        cursor = match.end()
    output.append(source[cursor:])
    return "".join(output).strip()


def extract_orientation(source: str) -> tuple[str, str]:
    match = re.search(r"(?m)^\\orient", source)
    if not match:
        return "", source
    arguments, end = command_arguments(source, match.start(), "orient", 3)
    replacement = (
        "\\begin{frame}[t]{Objectifs}\n"
        f"\\orientcontent{{{arguments[0]}}}{{{arguments[1]}}}{{{arguments[2]}}}\n"
        "\\end{frame}"
    )
    return replacement, source[: match.start()] + source[end:]


def chapter_source(name: str) -> str:
    source = (ROOT / "chapters" / f"{name}.tex").read_text(encoding="utf-8")
    source = re.sub(r"(?m)^% !TeX root.*\n", "", source)

    chapter_match = re.search(r"(?m)^\\chapter", source)
    if not chapter_match:
        raise ValueError(f"chapitre absent dans {name}")
    (title,), chapter_end = command_arguments(
        source, chapter_match.start(), "chapter", 1
    )

    label_match = re.match(r"\s*\\label\{([^}]+)\}", source[chapter_end:])
    if not label_match:
        raise ValueError(f"label de chapitre absent dans {name}")
    label = label_match.group(1)
    body_start = chapter_end + label_match.end()
    body = source[: chapter_match.start()] + source[body_start:]

    orientation, body = extract_orientation(body)
    headings = list(re.finditer(r"(?m)^\\(section|subsection)", body))

    output = [f"\\coursechapter{{{title}}}{{{label}}}"]
    if orientation:
        output.append(orientation)

    cursor = 0
    for index, heading in enumerate(headings):
        prelude = body[cursor : heading.start()]
        if significant(prelude):
            output.append(
                "\\begin{frame}[t,fragile,allowframebreaks]{En bref}\n"
                f"{normalize_chunk(prelude)}\n"
                "\\end{frame}"
            )

        kind = heading.group(1)
        (heading_title,), heading_end = command_arguments(
            body, heading.start(), kind, 1
        )
        next_start = (
            headings[index + 1].start() if index + 1 < len(headings) else len(body)
        )
        chunk = normalize_chunk(body[heading_end:next_start])
        navigation = "subsection" if kind == "section" else "subsubsection"
        output.append(f"\\{navigation}{{{heading_title}}}")
        output.append(
            "\\begin{frame}[t,fragile,allowframebreaks]"
            f"{{{heading_title}}}\n{chunk}\n\\end{{frame}}"
        )
        cursor = next_start

    if not headings and significant(body):
        output.append(
            "\\begin{frame}[t,fragile,allowframebreaks]{En bref}\n"
            f"{normalize_chunk(body)}\n"
            "\\end{frame}"
        )

    return "\n\n".join(output)


def main() -> None:
    output = [
        "% Fichier généré par scripts/gen_slides_source.py — ne pas modifier.",
    ]
    for title, numbering, chapters in PARTS:
        if numbering == "reperes":
            output.append("\\coursereperes")
        elif numbering == "main":
            output.append("\\coursemain")
        elif numbering == "appendices":
            output.append("\\courseappendices")
        output.append(f"\\coursepart{{{title}}}")
        output.extend(chapter_source(chapter) for chapter in chapters)

    OUTPUT.write_text("\n\n".join(output) + "\n", encoding="utf-8")
    print(f"corps du diaporama  {OUTPUT.name}")


if __name__ == "__main__":
    main()
