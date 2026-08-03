#!/usr/bin/env python3
"""Produit le corps Beamer progressif à partir des chapitres du cours long.

Le texte long reste la source de vérité. Ses sections sont assemblées dans
l'ordre causal de la régression logistique, indépendamment de leur fichier
d'origine. Chaque section devient une notion de diaporama ; Beamer peut ensuite
la poursuivre sur plusieurs vues. Les figures et tableaux commencent toujours
une nouvelle vue.
"""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "regression_logistique_slides_body.tex"

STAGES = (
    (
        "Poser le problème",
        "Problème",
        "courseproblem",
        "reperes",
        (
            ("p0_contrat", None),
            (
                "p0_probleme",
                (
                    "Données, entrée et sortie",
                    "Régression linéaire et régression logistique",
                    "Vue graphique globale",
                    "Utilisation générale",
                ),
            ),
        ),
    ),
    (
        "Préparer les données",
        "Données",
        "coursedata",
        "main",
        (
            ("p1_standardisation", None),
            (
                "p2_donnees",
                (
                    "Parcours de programmation",
                    "Préparation des données",
                ),
            ),
        ),
    ),
    (
        "Construire le score",
        "Score",
        "coursescore",
        "continue",
        (
            ("p1_nuage", None),
            ("p2_donnees", ("Le score d'une observation",)),
        ),
    ),
    (
        "Passer du score à une probabilité",
        "Probabilité",
        "courseprobability",
        "continue",
        (
            (
                "p1_probabilite",
                ("Cote, logit et hypothèse du modèle",),
            ),
            ("p3_logit", None),
            (
                "p1_probabilite",
                (
                    "Fonction logistique",
                    "Fonctions de liaison et alternatives",
                    "Calcul de la probabilité",
                ),
            ),
            ("p3_sigmoide", None),
            ("p2_donnees", ("La probabilité",)),
        ),
    ),
    (
        "Mesurer l'erreur",
        "Perte",
        "courseloss",
        "continue",
        (
            (
                "p1_erreur",
                ("Perte associée à une prédiction",),
            ),
            ("p3_cout", None),
            (
                "p1_erreur",
                (
                    "Coût moyen sur le fichier",
                    "Répartition de la perte",
                    "Comptage et coût",
                ),
            ),
            (
                "p2_donnees",
                (
                    "La perte d'une prédiction",
                    "La perte moyenne",
                ),
            ),
        ),
    ),
    (
        "Apprendre les coefficients",
        "Optimisation",
        "courseoptimization",
        "continue",
        (
            ("p3_gradient", None),
            ("p1_descente", None),
            ("p2_entrainer", None),
            ("p1_modele", None),
        ),
    ),
    (
        "Décider et évaluer",
        "Évaluation",
        "courseevaluation",
        "continue",
        (
            ("p1_classifieur", None),
            ("p2_predire", None),
            ("p0_probleme", ("Résultat hors échantillon",)),
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


def safe_cross_references(source: str) -> str:
    """Neutralise les deux-points actifs de babel dans les ancres Beamer."""

    return re.sub(
        r"\\(label|ref|eqref|pageref)\{([^{}]+)\}",
        lambda match: (
            f"\\{match.group(1)}"
            f"{{{match.group(2).replace(':', '-')}}}"
        ),
        source,
    )


def adapt_slide_copy(source: str) -> str:
    """Retire du discours de projection les annexes absentes du diaporama."""

    integrated_references = {
        "ann:logit": "étape~« Probabilité »",
        "ann:sigmoide": "étape~« Probabilité »",
        "ann:cout": "étape~« Perte »",
        "ann:gradient": "étape~« Optimisation »",
    }
    for label, replacement in integrated_references.items():
        source = source.replace(f"\\annexeref{{{label}}}", replacement)

    replacements = {
        "Objectifs évaluables de la partie~I.": "Objectifs évaluables du parcours.",
        "Énoncé du problème traité en partie~I": "Énoncé du problème traité",
        "réduites aux deux colonnes employées dans la\npartie~I.": (
            "réduites aux deux colonnes employées ici."
        ),
        "partie~I ; Python : fonctions, listes, boucles": (
            "statistique descriptive ; Python : fonctions, listes, boucles"
        ),
        "Le code de la partie~II travaille": "Le code de préparation travaille",
        "Les figures de la partie~I emploient": "Les figures précédentes emploient",
        "figures de la\n    partie~I": "figures du parcours",
        "partie~II \\\\": "boucle programmée \\\\",
        "Les annexes suivantes tirent les conséquences": (
            "La suite du parcours tire les conséquences"
        ),
        "approfondissement ; le fil principal n'emploie que la formule encadrée": (
            "justification intégrée ; la formule est utilisée immédiatement après"
        ),
        "approfondissement ; le fil principal n'emploie que les deux égalités encadrées": (
            "justification intégrée ; les deux égalités sont utilisées immédiatement après"
        ),
        "essentiel ; la dérivation par vraisemblance est reportée à\n"
        "l'étape~« Perte »": (
            "parcours continu ; la dérivation par vraisemblance vient juste après"
        ),
    }
    for original, replacement in replacements.items():
        source = source.replace(original, replacement)

    source = re.sub(
        r"Prérequis\. Les mathématiques couvrent la partie~I et les annexes de\s+"
        r"démonstration ; la programmation intervient dans la partie~II\.",
        "Prérequis. Les mathématiques sont mobilisées dans le modèle et ses "
        "fondements ; la programmation intervient dans l'implémentation.",
        source,
    )
    source = re.sub(
        r"La partie~II écrit le programme correspondant et suppose la partie~I\. "
        r"Les\s+annexes portent les démonstrations et supposent la partie~I ainsi "
        r"que les\s+rappels de l'\\annexeref\{ann:prerequis\}\. Le fil principal "
        r"énonce les résultats\s+employés ; les encadrés \\emph\{approfondissement\} "
        r"renvoient à leurs\s+démonstrations\.",
        "Le parcours projeté relie le modèle, son implémentation et ses "
        "fondements mathématiques. Les rappels et les corrigés restent "
        "disponibles dans le cours long.",
        source,
    )
    return source.replace(
        "la perte employée par le fil principal",
        "la perte employée dans la suite",
    ).replace(
        "la formule du gradient\nemployée par le fil principal",
        "la formule du gradient employée dans la suite",
    )


def normalize_chunk(source: str) -> str:
    source = adapt_slide_copy(source)
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
    source = "".join(output)

    # Une figure ou une table du cours long peut être plus haute qu'une vue.
    # On conserve sa composition interne, mais on borne le bloc complet à la
    # zone réellement disponible sous le titre de la diapositive.
    source = source.replace(
        "\\begin{figure}", "\\begin{figure}\n\\begin{slidevisual}"
    )
    source = source.replace(
        "\\end{figure}", "\\end{slidevisual}\n\\end{figure}"
    )
    source = source.replace(
        "\\begin{table}", "\\begin{table}\n\\begin{slidevisual}"
    )
    source = source.replace(
        "\\end{table}", "\\end{slidevisual}\n\\end{table}"
    )
    return safe_cross_references(source).strip()


def extract_orientation(source: str) -> tuple[str, str]:
    match = re.search(r"(?m)^\\orient", source)
    if not match:
        return "", source
    arguments, end = command_arguments(source, match.start(), "orient", 3)
    arguments = [
        safe_cross_references(adapt_slide_copy(argument))
        for argument in arguments
    ]
    replacement = (
        "\\begin{frame}[t]{Objectifs}\n"
        f"\\orientcontent{{{arguments[0]}}}"
        f"{{{arguments[1]}}}"
        f"{{{arguments[2]}}}\n"
        "\\end{frame}"
    )
    return replacement, source[: match.start()] + source[end:]


def parse_chapter(
    name: str,
) -> tuple[str, str, str, str, list[tuple[str, str, str]]]:
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
    prelude = body[: headings[0].start()] if headings else body
    sections: list[tuple[str, str, str]] = []

    for index, heading in enumerate(headings):
        kind = heading.group(1)
        (heading_title,), heading_end = command_arguments(
            body, heading.start(), kind, 1
        )
        next_start = (
            headings[index + 1].start() if index + 1 < len(headings) else len(body)
        )
        chunk = normalize_chunk(body[heading_end:next_start])
        sections.append((kind, heading_title, chunk))

    return title, label, orientation, normalize_chunk(prelude), sections


def chapter_source(
    name: str,
    selected_titles: tuple[str, ...] | None,
    initialize: bool,
) -> tuple[str, set[tuple[str, str]]]:
    title, label, orientation, prelude, sections = parse_chapter(name)
    available = {section_title for _, section_title, _ in sections}
    requested = available if selected_titles is None else set(selected_titles)
    unknown = requested - available
    if unknown:
        raise ValueError(
            f"sections absentes de {name}: {', '.join(sorted(unknown))}"
        )

    output: list[str] = []
    if initialize:
        output.append(
            f"\\coursechapter{{{title}}}{{{label.replace(':', '-')}}}"
        )
        if orientation:
            output.append(orientation)
        if significant(prelude):
            output.append(
                "\\begin{frame}[t,fragile,allowframebreaks]{Point de départ}\n"
                f"{prelude}\n"
                "\\end{frame}"
            )

    emitted: set[tuple[str, str]] = set()
    for kind, section_title, chunk in sections:
        if section_title not in requested:
            continue
        emitted.add((name, section_title))
        navigation = "subsection" if kind == "section" else "subsubsection"
        output.append(f"\\{navigation}{{{section_title}}}")
        if significant(chunk):
            output.append(
                "\\begin{frame}[t,fragile,allowframebreaks]"
                f"{{{section_title}}}\n{chunk}\n\\end{{frame}}"
            )

    return "\n\n".join(output), emitted


def main() -> None:
    output = [
        "% Fichier généré par scripts/gen_slides_source.py — ne pas modifier.",
    ]
    initialized: set[str] = set()
    emitted: set[tuple[str, str]] = set()
    included: set[str] = set()
    total_stages = len(STAGES)
    for stage_index, (title, short_title, color, numbering, units) in enumerate(
        STAGES, start=1
    ):
        if numbering == "reperes":
            output.append("\\coursereperes")
        elif numbering == "main":
            output.append("\\coursemain")
        output.append(
            f"\\coursepart{{{title}}}{{{short_title}}}{{{color}}}"
            f"{{{stage_index}/{total_stages}}}{{{stage_index}}}"
        )
        for chapter, selected_titles in units:
            included.add(chapter)
            rendered, section_keys = chapter_source(
                chapter,
                selected_titles,
                initialize=chapter not in initialized,
            )
            duplicate = emitted & section_keys
            if duplicate:
                names = ", ".join(
                    f"{name}/{section}" for name, section in sorted(duplicate)
                )
                raise ValueError(f"sections projetées deux fois: {names}")
            emitted |= section_keys
            initialized.add(chapter)
            if rendered:
                output.append(rendered)

    expected = {
        (chapter, section_title)
        for chapter in included
        for _, section_title, _ in parse_chapter(chapter)[4]
    }
    missing = expected - emitted
    if missing:
        names = ", ".join(
            f"{name}/{section}" for name, section in sorted(missing)
        )
        raise ValueError(f"sections absentes du parcours: {names}")

    OUTPUT.write_text("\n\n".join(output) + "\n", encoding="utf-8")
    print(f"corps du diaporama  {OUTPUT.name}")


if __name__ == "__main__":
    main()
