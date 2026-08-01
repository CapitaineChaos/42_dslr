"""The four one-vs-rest probabilities per student, and how far their sum drifts
from one. Feeds the figure of the chapter on the four-house classifier."""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tuto'))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'V.0_Common'))
from dataset import HOUSES
from step4_total_cost import load, score_of
from step8_four_houses import train


def sigmoid(z):
    return 1 / (1 + math.exp(-z)) if z >= 0 else math.exp(z) / (1 + math.exp(z))


X, houses = load()
model = train(X, houses)

rows = []
for row, x in enumerate(X):
    probabilities = [sigmoid(score_of(model[house], x)) for house in HOUSES]
    rows.append((sum(probabilities), row, probabilities))
rows.sort()

print()
print(f"sum above 1 : {sum(1 for s, _, _ in rows if s > 1)} students")
print(f"sum below 1 : {sum(1 for s, _, _ in rows if s < 1)} students")
for label, (total, row, probabilities) in [("lowest", rows[0]),
                                           ("median", rows[len(rows) // 2]),
                                           ("highest", rows[-1])]:
    shown = "  ".join(f"{p:.3f}" for p in probabilities)
    print(f"{label:8} row {row:<5} {shown}   sum {total:.3f}   ({houses[row]})")
