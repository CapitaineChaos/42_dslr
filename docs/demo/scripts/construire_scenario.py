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

La configuration n'est pas devinée : le script balaie quelques réglages et
retient le premier qui satisfait toutes les bornes, ou échoue en le disant.
"""

from __future__ import annotations

import csv
import math
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
OUTPUT = HERE / "data" / "scenario.csv"

POSITIVE = "Gryffondor"
NEGATIVE = "Serpentard"

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

# Bornes de conformité : marqué, mais ni plat ni vertical.
NORM_RANGE = (2.5, 9.0)
LAST_FLIP_RANGE = (20, 300)
MAX_ITERATIONS = 700
MIN_LATE = 2
MIN_LEVELS = 4


def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def sigmoid(x: float) -> float:
    if x >= 0:
        return 1 / (1 + math.exp(-x))
    ex = math.exp(x)
    return ex / (1 + ex)


def softplus(x: float) -> float:
    return max(0.0, x) + math.log(1 + math.exp(-abs(x)))


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


def standardize(rows):
    pot = [r[1] for r in rows]
    vol = [r[2] for r in rows]
    def stat(col):
        mu = sum(col) / len(col)
        sd = (sum((v - mu) ** 2 for v in col) / len(col)) ** 0.5
        return mu, sd
    mu_p, sd_p = stat(pot)
    mu_v, sd_v = stat(vol)
    design = [[1.0, (r[1] - mu_p) / sd_p, (r[2] - mu_v) / sd_v] for r in rows]
    targets = [1 if r[3] == POSITIVE else 0 for r in rows]
    return design, targets, (mu_p, sd_p, mu_v, sd_v)


def descend(design, targets, alpha, max_iter=6000, epsilon=1e-6):
    weights = [0.0, 0.0, 0.0]
    trace = []
    previous = float("inf")
    for _ in range(max_iter):
        cost = 0.0
        slope = [0.0, 0.0, 0.0]
        for row, y in zip(design, targets):
            z = sum(w * x for w, x in zip(weights, row))
            cost += softplus(z) - y * z
            delta = sigmoid(z) - y
            for col in range(3):
                slope[col] += delta * row[col]
        cost /= len(targets)
        for col in range(3):
            slope[col] /= len(targets)
        trace.append((cost, list(weights)))
        if abs(previous - cost) / max(1, abs(cost)) < epsilon:
            break
        previous = cost
        for col in range(3):
            weights[col] -= alpha * slope[col]
    return trace


def predictions(design, weights):
    return [1 if sum(w * x for w, x in zip(weights, row)) > 0 else 0 for row in design]


def measure(design, targets, trace):
    """Mesure les propriétés visées, sans juger."""
    n = len(targets)
    flips = {}
    previous = predictions(design, trace[0][1])
    for t in range(1, len(trace)):
        current = predictions(design, trace[t][1])
        for i in range(n):
            if current[i] != previous[i]:
                flips.setdefault(i, []).append(t)
        previous = current

    def accuracy(t):
        pred = predictions(design, trace[t][1])
        return sum(1 for p, y in zip(pred, targets) if p == y) / n

    marks = [t for t in (0, 1, 2, 5, 10, 25, 50, 100, 200, len(trace) - 1)
             if t < len(trace)]
    return {
        "iterations": len(trace),
        "norm": math.hypot(*trace[-1][1][1:]),
        "last_flip": max((max(v) for v in flips.values()), default=0),
        "late": sum(1 for v in flips.values() if max(v) > 10),
        "levels": len({round(accuracy(t), 3) for t in marks}),
        "marks": [(t, trace[t][0], accuracy(t)) for t in marks],
        "accuracy_final": accuracy(len(trace) - 1),
    }


def conforms(m) -> list[str]:
    """Renvoie la liste des bornes violées, vide si tout tient."""
    faults = []
    if not NORM_RANGE[0] <= m["norm"] <= NORM_RANGE[1]:
        faults.append(f"‖w‖ {m['norm']:.2f} hors [{NORM_RANGE[0]}, {NORM_RANGE[1]}]")
    if not LAST_FLIP_RANGE[0] <= m["last_flip"] <= LAST_FLIP_RANGE[1]:
        faults.append(f"dernier basculement {m['last_flip']} hors "
                      f"[{LAST_FLIP_RANGE[0]}, {LAST_FLIP_RANGE[1]}]")
    if m["iterations"] > MAX_ITERATIONS:
        faults.append(f"{m['iterations']} itérations, plafond {MAX_ITERATIONS}")
    if m["late"] < MIN_LATE:
        faults.append(f"{m['late']} basculement(s) tardif(s), minimum {MIN_LATE}")
    if m["levels"] < MIN_LEVELS:
        faults.append(f"{m['levels']} paliers d'exactitude, minimum {MIN_LEVELS}")
    return faults


def show(label, m, faults):
    print(f"{label}")
    print(f"  {m['iterations']} tours, ‖w‖ {m['norm']:.2f}, "
          f"dernier basculement t={m['last_flip']}, {m['late']} tardifs, "
          f"{m['levels']} paliers")
    if faults:
        for fault in faults:
            print(f"    rejeté : {fault}")
    else:
        print("  t      J        exactitude")
        for t, cost, acc in m["marks"]:
            print(f"  {t:<6} {cost:.4f}   {acc * 100:5.1f} %")


def main() -> None:
    chosen = None
    for count, spread, contradicted, alpha in TRIALS:
        rows = build(count, spread, contradicted)
        design, targets, _ = standardize(rows)
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
    OUTPUT.parent.mkdir(exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter=";")
        writer.writerow(["id", "eleve", "maison", "potions", "vol", "usage", "alpha"])
        for index, (name, potions, vol, house) in enumerate(rows, start=1):
            usage = "test" if index % 6 == 0 else "apprentissage"
            writer.writerow([f"S{index:02d}", name, house, f"{potions:g}",
                             f"{vol:g}", usage, f"{alpha:g}"])
    print(f"\n{OUTPUT}: {len(rows)} élèves, α = {alpha}, "
          f"{m['iterations']} tours, exactitude finale "
          f"{m['accuracy_final'] * 100:.1f} %")


if __name__ == "__main__":
    main()
