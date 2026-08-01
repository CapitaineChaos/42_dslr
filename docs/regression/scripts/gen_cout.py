import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')
from math import log, exp
from dataset import Data

OUT = os.path.join(HERE, '..', 'data')
data = Data(os.path.join(DATASETS, 'dataset_train.csv'))
MU = {"Herbology": 1.1890, "Ancient Runes": 495.0517}
SD = {"Herbology": 5.1745, "Ancient Runes": 105.1857}
W = (-4.7454, -3.4535, 3.4688)

def col(name):
    c = data.courses[name]
    present = sorted(v for v in c if v is not None)
    med = present[len(present) // 2]
    return [(v if v is not None else med) for v in c]

h, r = col("Herbology"), col("Ancient Runes")
softplus = lambda z: max(z, 0) + log(1 + exp(-abs(z)))

rows = []
for i, (hv, rv, house) in enumerate(zip(h, r, data.houses)):
    x1 = (hv - MU["Herbology"]) / SD["Herbology"]
    x2 = (rv - MU["Ancient Runes"]) / SD["Ancient Runes"]
    z = W[0] + W[1] * x1 + W[2] * x2
    y = 1.0 if house == "Gryffindor" else 0.0
    rows.append((x1, x2, softplus(z) - y * z))

with open(f'{OUT}/cout_eleves.dat', 'w') as f:
    f.write("x y cost\n")
    for i, (x1, x2, c) in enumerate(rows):
        if i % 2 == 0:
            f.write(f"{x1:.4f} {x2:.4f} {min(c, 3.0):.4f}\n")

chers = sorted(rows, key=lambda t: -t[2])[:5]
print("cinq eleves les plus couteux :")
for x1, x2, c in chers:
    print(f"  Herbo {x1:+.2f}  Runes {x2:+.2f}  cout {c:.2f}")
total = sum(c for _, _, c in rows) / len(rows)
part = sum(c for _, _, c in sorted(rows, key=lambda t: -t[2])[:32]) / sum(c for _, _, c in rows)
print(f"cout moyen {total:.4f}")
print(f"les 2 % les plus couteux portent {part:.1%} du cout total")
