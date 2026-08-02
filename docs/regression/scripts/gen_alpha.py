"""Cost per iteration for several learning rates, on the real 1600 students."""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tuto'))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'V.0_Common'))
from step4_total_cost import load, fit_stats, design

OUT = os.path.join(HERE, '..', 'data')
RATES = [0.05, 0.3, 1.0, 100.0]
STEPS = 40
columns, houses = load()
all_rows = list(range(len(houses)))
X = design(columns, fit_stats(columns, all_rows), all_rows)
y = [1.0 if house == "Gryffindor" else 0.0 for house in houses]
m = len(X)


def sigmoid(z):
    return 1 / (1 + math.exp(-z)) if z >= 0 else math.exp(z) / (1 + math.exp(z))


def run(alpha):
    w = [0.0, 0.0, 0.0]
    trace = []
    for _ in range(STEPS + 1):
        cost, grad = 0.0, [0.0, 0.0, 0.0]
        for x, target in zip(X, y):
            z = sum(w[j] * x[j] for j in range(3))
            p = sigmoid(z)
            cost -= target * math.log(p) + (1 - target) * math.log(1 - p)
            for j in range(3):
                grad[j] += (p - target) * x[j]
        trace.append(cost / m)
        w = [w[j] - alpha * grad[j] / m for j in range(3)]
    return trace


traces = {alpha: run(alpha) for alpha in RATES}
with open(f'{OUT}/alpha.dat', 'w') as f:
    f.write("iter " + " ".join(f"a{str(a).replace('.', '')}" for a in RATES) + "\n")
    for step in range(STEPS + 1):
        f.write(f"{step} " + " ".join(f"{traces[a][step]:.6f}" for a in RATES) + "\n")

for alpha in RATES:
    trace = traces[alpha]
    reached = next((i for i, c in enumerate(trace) if c < 0.15), None)
    target = f"{reached} iterations" if reached is not None else "not reached"
    print(f"alpha {alpha:<5} cost after {STEPS} steps {trace[-1]:.4f}   below 0.15 : {target}")
