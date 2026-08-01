"""Gryffindor contre le reste, sur deux matieres. Tout le document en un fichier."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')

from math import exp, log
from dataset import Data

MATIERES = ["Herbology", "Ancient Runes"]
MAISON = "Gryffindor"
ALPHA, ITERATIONS = 1.0, 400

def sigmoide(z):
    if z >= 0:
        return 1 / (1 + exp(-z))
    return exp(z) / (1 + exp(z))

def softplus(z):
    return max(z, 0) + log(1 + exp(-abs(z)))

# 1. lire, imputer, standardiser
eleves = Data(os.path.join(DATASETS, 'dataset_train.csv'))
X, stats = [], {}
for matiere in MATIERES:
    notes = eleves.courses[matiere]
    presentes = sorted(v for v in notes if v is not None)
    med = presentes[len(presentes) // 2]
    remplies = [v if v is not None else med for v in notes]
    mu = sum(remplies) / len(remplies)
    sd = (sum((v - mu) ** 2 for v in remplies) / len(remplies)) ** 0.5
    stats[matiere] = (med, mu, sd)
    for i, note in enumerate(remplies):
        if len(X) <= i:
            X.append([1.0])
        X[i].append((note - mu) / sd)

cible = [1.0 if maison == MAISON else 0.0 for maison in eleves.houses]
m = len(X)

# 2. descendre
poids = [0.0] * len(X[0])
for iteration in range(ITERATIONS + 1):
    cout, pente = 0.0, [0.0] * len(poids)
    for x, attendue in zip(X, cible):
        score = 0.0
        for colonne in range(len(poids)):
            score += poids[colonne] * x[colonne]
        cout += softplus(score) - attendue * score
        ecart = sigmoide(score) - attendue
        for colonne in range(len(poids)):
            pente[colonne] += ecart * x[colonne]
    cout /= m
    if iteration in (0, 1, 10, 400):
        print(f"iteration {iteration:>3}  cout {cout:.6f}  "
              f"poids {' '.join(f'{p:+.4f}' for p in poids)}")
    for colonne in range(len(poids)):
        poids[colonne] -= ALPHA * pente[colonne] / m

# 3. classer
justes = sum(1 for x, attendue in zip(X, cible)
             if (sum(p * v for p, v in zip(poids, x)) >= 0) == (attendue == 1))
print(f"\n{justes} eleves sur {m} du bon cote, soit {justes / m:.4f}")
for matiere in MATIERES:
    med, mu, sd = stats[matiere]
    print(f"{matiere:<15} mediane {med:>8.3f}  moyenne {mu:>8.3f}  ecart-type {sd:>7.3f}")
