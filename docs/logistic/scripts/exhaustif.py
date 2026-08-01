import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')

import itertools
import numpy as np
from selection import charger, exactitude, MATIERES

notes, maisons = charger()

# delta du tableau 8.3, dans l'ordre de MATIERES
DELTA = {"Astronomy": 1.911, "Herbology": 1.879, "Divination": 2.368,
         "Muggle Studies": 2.038, "Ancient Runes": 1.860,
         "History of Magic": 2.221, "Transfiguration": 2.284,
         "Potions": 2.076, "Charms": 2.466, "Flying": 2.657}

print("=== retrait par delta croissant ===")
ordre = sorted(range(10), key=lambda c: DELTA[MATIERES[c]])
courant = list(range(10))
for retiree in ordre[:-1]:
    moy, ec, _ = exactitude(courant, notes, maisons)
    print(f"{len(courant):2d} matières  {moy:.4f} ± {ec:.4f}   "
          f"sans {[MATIERES[c] for c in ordre[:ordre.index(retiree)]]}")
    courant = [c for c in courant if c != retiree]

print()
print("=== tous les sous-ensembles de 4 matières ===")
res = []
for combo in itertools.combinations(range(10), 4):
    moy, _, _ = exactitude(combo, notes, maisons)
    res.append((moy, combo))
res.sort(reverse=True)
print(f"{len(res)} configurations ; max {res[0][0]:.4f}, min {res[-1][0]:.4f}")
atteignent = [c for m, c in res if m >= 0.9850]
print(f"{len(atteignent)} atteignent 0.9850 ou plus")
for m, c in res[:6]:
    print(f"  {m:.4f}  {[MATIERES[i] for i in c]}")
print("  ...")
for m, c in res[-3:]:
    print(f"  {m:.4f}  {[MATIERES[i] for i in c]}")
