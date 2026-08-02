"""Error count and cost along a shift of the bias, for the chapter on cost."""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tuto'))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'V.0_Common'))
from step4_total_cost import load, fit_stats, design

OUT = os.path.join(HERE, '..', 'data')
W1, W2 = -3.4535, 3.4688
columns, houses = load()
all_rows = list(range(len(houses)))
X = design(columns, fit_stats(columns, all_rows), all_rows)
y = [1.0 if house == "Gryffindor" else 0.0 for house in houses]


def sigmoid(z):
    return 1 / (1 + math.exp(-z)) if z >= 0 else math.exp(z) / (1 + math.exp(z))


def loss(z, target):
    return max(z, 0.0) + math.log1p(math.exp(-abs(z))) - target * z


def measure(w0):
    cost, wrong = 0.0, 0
    for x, target in zip(X, y):
        z = w0 + W1 * x[1] + W2 * x[2]
        cost += loss(z, target)
        if (z >= 0) != (target == 1.0):
            wrong += 1
    return cost / len(X), wrong


with open(f'{OUT}/comparaison.dat', 'w') as f:
    f.write("w0 cost wrong\n")
    for step in range(161):
        w0 = -6.5 + step * 0.025
        cost, wrong = measure(w0)
        f.write(f"{w0:.3f} {cost:.6f} {wrong}\n")

for label, w in [("iteration 50", (-2.7318, -2.0538, 1.9613)),
                 ("iteration 400", (-4.7454, -3.4535, 3.4688)),
                 ("1.5 x iteration 400", (-7.1181, -5.1803, 5.2032))]:
    cost, wrong = 0.0, 0
    for x, target in zip(X, y):
        z = w[0] + w[1] * x[1] + w[2] * x[2]
        cost += loss(z, target)
        if (z >= 0) != (target == 1.0):
            wrong += 1
    print(f"{label:22} cost {cost / len(X):.4f}   correct {len(X) - wrong}/{len(X)}")
