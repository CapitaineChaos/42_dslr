#!/usr/bin/env python3
"""Construit un jeu de données conçu pour que la descente soit lisible.

Le micro-cas des slides converge en un pas : quatre erreurs dès l'itération 1,
inchangées ensuite. Rien n'y est faux, mais il ne montre pas la mécanique.

Le scénario vise une descente franche et courte, pas spectaculaire :

* une nappe qui part plate et finit nettement inclinée, sans devenir une
  falaise : la norme finale des poids reste dans une fourchette ;
* une exactitude qui progresse par paliers au lieu d'être acquise au premier
  pas ;
* quelques élèves qui changent de côté après la dixième itération, le dernier
  avant la trois-centième ;
* le tout sur une vingtaine d'élèves et quelques centaines de tours.

Le levier est le conditionnement. Les deux notes montent ensemble : c'est la
direction de plus grande variance, et elle ne dit rien de la maison.
L'étiquette dépend d'un écart perpendiculaire plus étroit, dans un rapport que
`SPREADS` fait varier. Plus ce rapport est grand, plus la descente met de tours
à pivoter, et plus les basculements sont tardifs.

Des étiquettes contredites interdisent la séparation parfaite. Sans elles les
poids partiraient à l'infini et la nappe deviendrait verticale.

Une troisième maison s'ajoute ensuite au bout de l'axe commun : ses élèves sont
bons dans les deux matières. L'écart perpendiculaire ne les distingue pas, si
bien que les modèles un contre tous des deux premières maisons doivent aussi
les écarter, et que les premiers recouvrent le haut de la bande des deux
autres. Les bornes de scenario_calcul.py portent sur la descente des deux
premières maisons ; le rapport final donne les trois modèles un contre tous.

La configuration n'est pas devinée : le script balaie quelques réglages et
retient le premier qui satisfait toutes les bornes, ou échoue en le disant.
"""

from __future__ import annotations

import csv
from pathlib import Path

from scenario_calcul import conforms, descend, measure, predictions, show, standardize

HERE = Path(__file__).resolve().parents[1]
OUTPUT = HERE / "data" / "scenario.csv"

POSITIVE = "Gryffondor"
NEGATIVE = "Serpentard"
THIRD = "Poufsouffle"
HOUSES = [POSITIVE, THIRD, NEGATIVE]

PRENOMS = [
    "Alice", "Basile", "Camille", "Damien", "Elsa", "Félix", "Gaspard", "Hélène",
    "Iris", "Jonas", "Kenza", "Louis", "Maya", "Noé", "Olga", "Paul", "Quentin",
    "Rosa", "Samuel", "Théa", "Ulysse", "Vera", "Wanda", "Xavier", "Yann", "Zoé",
    "Adrien", "Bérénice", "Côme", "Diane", "Émile", "Faustine", "Gabin", "Hugo",
    "Inès", "Jules", "Klara", "Léa", "Marin", "Nina",
]

# Les deux notes montent ensemble : c'est la direction de plus grande variance,
# et elle ne dit rien de la maison. L'étiquette dépend d'un petit écart
# perpendiculaire, vingt fois plus étroit. La descente commence donc par suivre
# la pente évidente, puis met des centaines d'itérations à pivoter vers la
# direction qui sépare vraiment : c'est pendant ce pivot que les élèves de la
# frange changent de côté.
# Écarts perpendiculaires, du plus franc au plus serré. Les derniers portent
# les basculements tardifs : un élève posé à quatre centièmes de la charnière
# attend que la direction ait fini de pivoter.
MARGINS = [0.62, -0.62, 0.40, -0.40, 0.26, -0.26, 0.15, -0.15,
           0.09, -0.09, 0.04, -0.04]

# Réglages balayés : nombre d'élèves, demi-étalement le long de l'axe commun,
# indices dont l'étiquette est contredite, pas de descente.
TRIALS = [
    (22, 1.5, {5, 14}, 1.0),
    (22, 1.8, {5, 14}, 1.0),
    (24, 1.8, {5, 14, 19}, 1.0),
    (24, 2.1, {5, 14, 19}, 1.0),
    (26, 2.1, {5, 14, 19}, 1.0),
    (26, 2.4, {5, 14, 19, 22}, 1.0),
    (28, 2.4, {5, 14, 19, 22}, 1.0),
]

# Troisième maison : (position le long de l'axe commun, écart perpendiculaire).
THIRD_POINTS = [(1.4, 0.18), (1.5, -0.22), (1.6, 0.05), (1.7, -0.12),
                (1.8, 0.25), (1.9, -0.04), (1.65, -0.28), (1.85, 0.1)]

# Notes effacées après coup, pour que l'imputation par la médiane ait quelque
# chose à combler. Choisies près de la médiane de leur matière : la valeur
# imputée reste proche de la note effacée, et la descente vérifiée plus haut
# n'en est presque pas modifiée.
MISSING = {"S10": "vol", "S14": "potions"}

def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def build(count: int, spread: float, contradicted: set[int]):
    rows = []
    for index in range(count):
        along = -spread + (2 * spread * index) / (count - 1)
        margin = MARGINS[index % len(MARGINS)]
        x1 = along + margin
        x2 = along - margin
        positive = margin > 0
        if index in contradicted:
            positive = not positive
        potions = round(clamp(10 + 4 * x1, 0, 20), 4)
        vol = round(clamp(50 + 20 * x2, 0, 100), 4)
        rows.append((PRENOMS[index % len(PRENOMS)], potions, vol,
                     POSITIVE if positive else NEGATIVE))
    return rows


def third(start: int):
    rows = []
    for offset, (along, margin) in enumerate(THIRD_POINTS):
        potions = round(clamp(10 + 4 * (along + margin), 0, 20), 4)
        vol = round(clamp(50 + 20 * (along - margin), 0, 100), 4)
        rows.append((PRENOMS[(start + offset) % len(PRENOMS)], potions, vol, THIRD))
    return rows


def one_vs_all(rows) -> None:
    """Un modèle par maison sur les élèves d'apprentissage, puis la maison du
    plus grand score."""
    learn = [row for index, row in enumerate(rows, start=1) if index % 6]
    design, _, _ = standardize(learn, POSITIVE)
    weights = {}
    print("\nun contre tous, élèves d'apprentissage")
    for house in HOUSES:
        targets = [1 if row[3] == house else 0 for row in learn]
        trace = descend(design, targets, 1.0)
        weights[house] = trace[-1][1]
        wrong = sum(1 for p, y in zip(predictions(design, weights[house]), targets) if p != y)
        print(f"  {house:<12} {len(trace) - 1:>5} itérations, {wrong} erreurs sur {len(learn)}")
    good = 0
    for row, x in zip(learn, design):
        scores = {house: sum(w * v for w, v in zip(weights[house], x)) for house in HOUSES}
        good += max(scores, key=scores.get) == row[3]
    print(f"  plus grand score : {good} sur {len(learn)}")


def main() -> None:
    chosen = None
    for count, spread, contradicted, alpha in TRIALS:
        rows = build(count, spread, contradicted)
        design, targets, _ = standardize(rows, POSITIVE)
        trace = descend(design, targets, alpha)
        m = measure(design, targets, trace)
        faults = conforms(m)
        show(f"{count} élèves, étalement {spread}, "
             f"{len(contradicted)} contredits, α = {alpha}", m, faults)
        if not faults:
            chosen = (rows, alpha, m)
            break
        print()

    if chosen is None:
        raise SystemExit("aucun réglage ne tient les bornes, élargir TRIALS")

    rows, alpha, m = chosen
    rows = rows + third(len(rows))
    one_vs_all(rows)
    OUTPUT.parent.mkdir(exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter=";")
        writer.writerow(["id", "eleve", "maison", "potions", "vol", "usage", "alpha"])
        for index, (name, potions, vol, house) in enumerate(rows, start=1):
            ident = f"S{index:02d}"
            usage = "test" if index % 6 == 0 else "apprentissage"
            notes = {"potions": f"{potions:g}", "vol": f"{vol:g}"}
            if ident in MISSING:
                notes[MISSING[ident]] = ""
            writer.writerow([ident, name, house, notes["potions"], notes["vol"],
                             usage, f"{alpha:g}"])
    print(f"\n{OUTPUT}: {len(rows)} élèves, α = {alpha}, "
          f"{m['iterations']} tours, exactitude finale "
          f"{m['accuracy_final'] * 100:.1f} %")


if __name__ == "__main__":
    main()
