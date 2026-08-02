"""Cost split between correctly and wrongly classified students, along a scaling
of the final coefficients. Feeds the figure on what limits the transition slope."""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tuto'))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'V.0_Common'))
from step4_total_cost import load, fit_stats, design

OUT = os.path.join(HERE, '..', 'data')
W = (-4.7454, -3.4535, 3.4688)
columns, houses = load()
all_rows = list(range(len(houses)))
X = design(columns, fit_stats(columns, all_rows), all_rows)
y = [1.0 if house == "Gryffindor" else 0.0 for house in houses]


def sigmoid(z):
    return 1 / (1 + math.exp(-z)) if z >= 0 else math.exp(z) / (1 + math.exp(z))


NORM = math.hypot(W[1], W[2])

with open(f'{OUT}/echelle.dat', 'w') as f:
    f.write("norme total right wrong\n")
    for step in range(1, 121):
        scale = step * 0.025
        good = bad = 0.0
        for x, target in zip(X, y):
            z = scale * (W[0] + W[1] * x[1] + W[2] * x[2])
            cost = max(z, 0.0) + math.log1p(math.exp(-abs(z))) - target * z
            if (z >= 0) == (target == 1.0):
                good += cost
            else:
                bad += cost
        m = len(X)
        f.write(f"{scale * NORM:.4f} {(good + bad) / m:.6f} {good / m:.6f} {bad / m:.6f}\n")

rows = [l.split() for l in open(f'{OUT}/echelle.dat').readlines()[1:]]
best = min(rows, key=lambda r: float(r[1]))
print(f"norm of the fitted model : {NORM:.4f}")
print(f"minimum at norm {best[0]} : total {best[1]}, right {best[2]}, wrong {best[3]}")
for r in (rows[3], rows[39], rows[43], rows[-1]):
    print(f"norm {r[0]:>8} : total {r[1]}  right {r[2]}  wrong {r[3]}")
