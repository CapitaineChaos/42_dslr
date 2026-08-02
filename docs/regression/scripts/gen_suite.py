"""Boundary position versus coefficient norm, iteration by iteration.

Shows that the boundary settles early while the norm keeps growing.
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tuto'))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'V.0_Common'))
from step4_total_cost import load, fit_stats, design

OUT = os.path.join(HERE, '..', 'data')
columns, houses = load()
all_rows = list(range(len(houses)))
X = design(columns, fit_stats(columns, all_rows), all_rows)
y = [1.0 if house == "Gryffindor" else 0.0 for house in houses]
m = len(X)


def sigmoid(z):
    return 1 / (1 + math.exp(-z)) if z >= 0 else math.exp(z) / (1 + math.exp(z))


w = [0.0, 0.0, 0.0]
rows = []
for step in range(401):
    if step:
        norm = math.hypot(w[1], w[2])
        slope = -w[1] / w[2]
        offset = -w[0] / norm
        rows.append((step, norm, slope, offset))
    grad = [0.0, 0.0, 0.0]
    for x, target in zip(X, y):
        d = sigmoid(sum(w[j] * x[j] for j in range(3))) - target
        for j in range(3):
            grad[j] += d * x[j]
    w = [w[j] - grad[j] / m for j in range(3)]

with open(f'{OUT}/suite.dat', 'w') as f:
    f.write("iter norme pente decalage\n")
    for step, norm, slope, offset in rows:
        f.write(f"{step} {norm:.4f} {slope:.4f} {offset:.4f}\n")

for step in (1, 10, 50, 100, 200, 400):
    _, norm, slope, offset = rows[step - 1]
    print(f"iter {step:>3} : norm {norm:6.3f}   slope {slope:6.3f}   offset {offset:6.3f}")
