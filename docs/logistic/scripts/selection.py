"""Élimination arrière sur les dix matières retenues, protocole du chapitre 8."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')

import csv
import itertools
import numpy as np

TRAIN = os.path.join(DATASETS, 'dataset_train.csv')
MATIERES = ["Astronomy", "Herbology", "Divination", "Muggle Studies",
            "Ancient Runes", "History of Magic", "Transfiguration",
            "Potions", "Charms", "Flying"]
MAISONS = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"]
ALPHA, EPS, MAX_ITER = 1.0, 1e-6, 6000
GRAINES = list(range(10))


def charger():
    lignes = list(csv.DictReader(open(TRAIN)))
    for l in lignes:
        if not l["Astronomy"] and l["Defense Against the Dark Arts"]:
            l["Astronomy"] = str(-100 * float(l["Defense Against the Dark Arts"]))
    notes = np.full((len(lignes), len(MATIERES)), np.nan)
    for i, l in enumerate(lignes):
        for j, m in enumerate(MATIERES):
            if l[m]:
                notes[i, j] = float(l[m])
    maisons = np.array([MAISONS.index(l["Hogwarts House"]) for l in lignes])
    return notes, maisons


def partition(maisons, graine, part=0.8):
    rng = np.random.default_rng(graine)
    tr, te = [], []
    for k in range(len(MAISONS)):
        idx = np.flatnonzero(maisons == k)
        rng.shuffle(idx)
        coupe = int(round(part * len(idx)))
        tr.append(idx[:coupe])
        te.append(idx[coupe:])
    return np.concatenate(tr), np.concatenate(te)


def preparer(notes, itr, ite, cols):
    brut = notes[:, cols]
    med = np.nanmedian(brut[itr], axis=0)
    rempli = np.where(np.isnan(brut), med, brut)
    mu = rempli[itr].mean(axis=0)
    sd = rempli[itr].std(axis=0)
    x = (rempli - mu) / sd
    biais = np.ones((len(x), 1))
    X = np.hstack([biais, x])
    return X[itr], X[ite]


def sigmoide(z):
    out = np.empty_like(z)
    pos = z >= 0
    out[pos] = 1 / (1 + np.exp(-z[pos]))
    ez = np.exp(z[~pos])
    out[~pos] = ez / (1 + ez)
    return out


def softplus(z):
    return np.maximum(z, 0) + np.log1p(np.exp(-np.abs(z)))


def ajuster(X, y):
    m = len(X)
    th = np.zeros(X.shape[1])
    cout_prec = None
    for _ in range(MAX_ITER):
        z = X @ th
        cout = float(np.mean(softplus(z) - y * z))
        g = X.T @ (sigmoide(z) - y) / m
        if cout_prec is not None and abs(cout_prec - cout) / max(1, abs(cout)) < EPS:
            break
        cout_prec = cout
        th -= ALPHA * g
    return th


def exactitude(cols, notes, maisons, graines=GRAINES):
    scores = []
    for graine in graines:
        itr, ite = partition(maisons, graine)
        Xtr, Xte = preparer(notes, itr, ite, list(cols))
        theta = np.stack([ajuster(Xtr, (maisons[itr] == k).astype(float))
                          for k in range(len(MAISONS))])
        pred = np.argmax(Xte @ theta.T, axis=1)
        scores.append(float(np.mean(pred == maisons[ite])))
    return float(np.mean(scores)), float(np.std(scores)), scores


def main():
    notes, maisons = charger()
    courant = list(range(len(MATIERES)))
    base, ecart, _ = exactitude(courant, notes, maisons)
    print(f"{len(courant):2d} matières  {base:.4f}  (± {ecart:.4f})  toutes")
    historique = [(len(courant), base, "toutes")]

    while len(courant) > 1:
        essais = []
        for retiree in courant:
            reste = [c for c in courant if c != retiree]
            moy, _, _ = exactitude(reste, notes, maisons)
            essais.append((moy, retiree, reste))
        essais.sort(reverse=True)
        moy, retiree, reste = essais[0]
        print(f"{len(reste):2d} matières  {moy:.4f}  ({moy - base:+.4f})  "
              f"retirée : {MATIERES[retiree]}")
        historique.append((len(reste), moy, MATIERES[retiree]))
        courant = reste

    print()
    print("meilleure configuration :",
          max(historique, key=lambda h: h[1]))


if __name__ == "__main__":
    main()
