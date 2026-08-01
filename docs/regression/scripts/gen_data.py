import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')
from math import log, exp
from dataset import Data

OUT = os.path.join(HERE, '..', 'data')
A, B = "Herbology", "Ancient Runes"
data = Data(os.path.join(DATASETS, 'dataset_train.csv'))

def prep(name):
    col = data.courses[name]
    present = sorted(v for v in col if v is not None)
    med = present[len(present) // 2]
    filled = [v if v is not None else med for v in col]
    mu = sum(filled) / len(filled)
    sd = (sum((v - mu) ** 2 for v in filled) / len(filled)) ** 0.5
    return [(v - mu) / sd for v in filled]

xa, xb = prep(A), prep(B)
y = [1.0 if h == "Gryffindor" else 0.0 for h in data.houses]

# nuage, un point sur trois pour rester lisible
with open(f'{OUT}/gryffindor.dat', 'w') as fg, open(f'{OUT}/autres.dat', 'w') as fa:
    fg.write("x y\n"); fa.write("x y\n")
    for i, (a, b, t) in enumerate(zip(xa, xb, y)):
        if i % 3:
            continue
        (fg if t else fa).write(f"{a:.4f} {b:.4f}\n")

X = [[1.0, a, b] for a, b in zip(xa, xb)]
m = len(X)
sigmoid = lambda z: 1 / (1 + exp(-z)) if z >= 0 else exp(z) / (1 + exp(z))
softplus = lambda z: max(z, 0) + log(1 + exp(-abs(z)))

w = [0.0, 0.0, 0.0]
with open(f'{OUT}/cout.dat', 'w') as fc, open(f'{OUT}/gradient.dat', 'w') as fn:
    fc.write("iter cost\n"); fn.write("iter norm\n")
    for it in range(401):
        g, c = [0.0, 0.0, 0.0], 0.0
        for r, t in zip(X, y):
            z = w[0] + w[1] * r[1] + w[2] * r[2]
            c += softplus(z) - t * z
            d = sigmoid(z) - t
            for j in range(3):
                g[j] += d * r[j]
        c /= m
        g = [v / m for v in g]
        fc.write(f"{it} {c:.6f}\n")
        fn.write(f"{it} {sum(v*v for v in g) ** 0.5:.6f}\n")
        if it in (0, 1, 2, 5, 10, 50, 400):
            print(f"iteration {it:>3} : w = ({w[0]:.4f}, {w[1]:.4f}, {w[2]:.4f})  cout {c:.6f}")
        for j in range(3):
            w[j] -= 1.0 * g[j]

# surface du cout sur (w1, w2), w0 fige a sa valeur finale
w0 = w[0]
with open(f'{OUT}/surface.dat', 'w') as fs:
    fs.write("w1 w2 cost\n")
    steps = 45
    for i in range(steps + 1):
        w1 = -6 + 8 * i / steps
        for k in range(steps + 1):
            w2 = -2 + 8 * k / steps
            c = sum(softplus(w0 + w1*r[1] + w2*r[2]) - t*(w0 + w1*r[1] + w2*r[2]) for r, t in zip(X, y)) / m
            fs.write(f"{w1:.4f} {w2:.4f} {c:.6f}\n")
        fs.write("\n")
print("w0 fige a", round(w0, 4))
