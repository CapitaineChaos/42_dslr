"""The four one-vs-rest probabilities per student, and how far their sum drifts
from one. Feeds the figure of the chapter on the four-house classifier."""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tuto'))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'V.0_Common'))
from dataset import HOUSES
from step4_total_cost import load, fit_stats, design, score_of
from step8_four_houses import train


def sigmoid(z):
    return 1 / (1 + math.exp(-z)) if z >= 0 else math.exp(z) / (1 + math.exp(z))


columns, houses = load()
all_rows = list(range(len(houses)))
X = design(columns, fit_stats(columns, all_rows), all_rows)
model = train(X, houses)

rows = []
for row, x in enumerate(X):
    probabilities = [sigmoid(score_of(model[house], x)) for house in HOUSES]
    rows.append((sum(probabilities), row, probabilities))
rows.sort()

print()
print(f"sum above 1 : {sum(1 for s, _, _ in rows if s > 1)} students")
print(f"sum below 1 : {sum(1 for s, _, _ in rows if s < 1)} students")
by_row = {row: (total, probabilities) for total, row, probabilities in rows}
# Les trois lignes portees par la figure du cours : somme minimale, somme
# voisine de 1, somme maximale.
for label, row in [("lowest", rows[0][1]), ("near one", 326),
                   ("highest", rows[-1][1])]:
    total, probabilities = by_row[row]
    shown = "  ".join(f"{p:.3f}" for p in probabilities)
    print(f"{label:9} row {row:<5} {shown}   sum {total:.3f}   ({houses[row]})")
