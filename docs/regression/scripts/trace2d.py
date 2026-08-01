"""Gryffindor contre le reste sur deux matieres, pour une figure lisible en 2D."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')
from math import log, exp
from dataset import Data

A, B = "Herbology", "Ancient Runes"
data = Data(os.path.join(DATASETS, 'dataset_train.csv'))

def prep(name):
    col = data.courses[name]
    present = sorted(v for v in col if v is not None)
    med = present[len(present) // 2]
    filled = [v if v is not None else med for v in col]
    mu = sum(filled) / len(filled)
    sd = (sum((v - mu) ** 2 for v in filled) / len(filled)) ** 0.5
    return [(v - mu) / sd for v in filled], mu, sd

xa, mua, sda = prep(A)
xb, mub, sdb = prep(B)
y = [1.0 if h == "Gryffindor" else 0.0 for h in data.houses]
X = [[1.0, a, b] for a, b in zip(xa, xb)]
m = len(X)

def sigmoid(z):
    return 1 / (1 + exp(-z)) if z >= 0 else exp(z) / (1 + exp(z))

def softplus(z):
    return max(z, 0) + log(1 + exp(-abs(z)))

def cost_of(w):
    return sum(softplus(w[0] + w[1] * r[1] + w[2] * r[2]) - t * (w[0] + w[1] * r[1] + w[2] * r[2]) for r, t in zip(X, y)) / m

w = [0.0, 0.0, 0.0]
alpha = 1.0
history = []
for it in range(400):
    g = [0.0, 0.0, 0.0]
    c = 0.0
    for r, t in zip(X, y):
        z = w[0] * r[0] + w[1] * r[1] + w[2] * r[2]
        c += softplus(z) - t * z
        d = sigmoid(z) - t
        for j in range(3):
            g[j] += d * r[j]
    c /= m
    history.append((it, c, list(w), [v / m for v in g]))
    for j in range(3):
        w[j] -= alpha * g[j] / m

print(f"{A} : mu={mua:.4f} sd={sda:.4f}")
print(f"{B} : mu={mub:.4f} sd={sdb:.4f}")
print()
print("iter      cost        w0        w1        w2      |grad|")
for it, c, ww, gg in history[:6] + [history[10], history[50], history[100], history[399]]:
    n = sum(v * v for v in gg) ** 0.5
    print(f"{it:>4}  {c:.6f}  {ww[0]:>8.4f}  {ww[1]:>8.4f}  {ww[2]:>8.4f}  {n:.6f}")
print()
gryff = sum(1 for t in y if t)
print(f"{gryff} Gryffindor sur {m}")
correct = sum(1 for r, t in zip(X, y) if (sigmoid(w[0] + w[1]*r[1] + w[2]*r[2]) >= 0.5) == (t == 1))
print(f"exactitude a 400 iterations : {correct}/{m} = {correct/m:.4f}")
