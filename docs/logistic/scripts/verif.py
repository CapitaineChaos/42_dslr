import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')

import numpy as np
from selection import charger, exactitude, MATIERES

notes, maisons = charger()
configs = {
    "toutes (10)": list(range(10)),
    "sans Flying (9)": [0, 1, 2, 3, 4, 5, 6, 7, 8],
    "4 premières": [0, 1, 2, 3],
    "Astronomy+Herbology": [0, 1],
    "Herbology seule": [1],
    "Astronomy+Ancient Runes+History": [0, 4, 5],
}
for nom, cols in configs.items():
    moy, ec, scores = exactitude(cols, notes, maisons)
    err = [round((1 - s) * 320) for s in scores]
    print(f"{nom:32s} {moy:.4f} ± {ec:.4f}  erreurs/graine {err}")
