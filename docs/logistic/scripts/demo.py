"""Trois mesures : séparation par paire, sélection imbriquée, désaccords appariés."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')

import itertools
import numpy as np
from selection import (charger, partition, preparer, ajuster, MATIERES, MAISONS)

notes, maisons = charger()
PAIRES = list(itertools.combinations(range(4), 2))
INIT = [m[0] for m in MAISONS]


def separation_par_paire():
    print("=== écart standardisé entre maisons, par matière ===")
    print(f"{'matière':<18}{'delta':>7}   " +
          "  ".join(f"{INIT[a]}{INIT[b]}" for a, b in PAIRES))
    table = {}
    for j, mat in enumerate(MATIERES):
        col = notes[:, j]
        s = np.nanstd(col)
        moy = np.array([np.nanmean(col[maisons == k]) for k in range(4)])
        ecarts = [abs(moy[a] - moy[b]) / s for a, b in PAIRES]
        table[mat] = ecarts
        delta = (moy.max() - moy.min()) / s
        print(f"{mat:<18}{delta:>7.2f}   " +
              "  ".join(f"{e:4.2f}" for e in ecarts))
    print()
    for i, (a, b) in enumerate(PAIRES):
        best = max(MATIERES, key=lambda m: table[m][i])
        print(f"paire {INIT[a]}{INIT[b]} : mieux séparée par {best} "
              f"({table[best][i]:.2f}) ; médiane des matières "
              f"{np.median([table[m][i] for m in MATIERES]):.2f}")
    return table


def eval_cols(cols, itr, ite):
    Xtr, Xte = preparer(notes, itr, ite, list(cols))
    theta = np.stack([ajuster(Xtr, (maisons[itr] == k).astype(float))
                      for k in range(4)])
    return np.argmax(Xte @ theta.T, axis=1)


def selection_imbriquee():
    """Sélection sur une validation interne, mesure sur le test tenu à l'écart."""
    print()
    print("=== sélection sans jamais regarder le test ===")
    resultats = []
    for graine in range(10):
        itr, ite = partition(maisons, graine)
        # validation interne découpée dans le seul ensemble d'apprentissage
        sous = partition(maisons[itr], graine + 100)
        i2, iv = itr[sous[0]], itr[sous[1]]
        courant = list(range(10))
        ref = float(np.mean(eval_cols(courant, i2, iv) == maisons[iv]))
        while len(courant) > 1:
            essais = []
            for retiree in courant:
                reste = [c for c in courant if c != retiree]
                acc = float(np.mean(eval_cols(reste, i2, iv) == maisons[iv]))
                essais.append((acc, retiree, reste))
            meilleur = max(essais)
            if meilleur[0] < ref - 0.005:
                break
            courant = meilleur[2]
        acc_test = float(np.mean(eval_cols(courant, itr, ite) == maisons[ite]))
        resultats.append((len(courant), acc_test, courant))
        print(f"graine {graine}: {len(courant)} matières retenues -> "
              f"test {acc_test:.4f}   {[MATIERES[c] for c in courant]}")
    tailles = [r[0] for r in resultats]
    accs = [r[1] for r in resultats]
    print(f"taille médiane {np.median(tailles):.0f}, "
          f"exactitude test moyenne {np.mean(accs):.4f} ± {np.std(accs):.4f}")
    return resultats


def desaccords(resultats):
    print()
    print("=== décisions du modèle complet contre le modèle réduit ===")
    total = diff = 0
    for graine, (_, _, cols) in enumerate(resultats):
        itr, ite = partition(maisons, graine)
        p10 = eval_cols(list(range(10)), itr, ite)
        pk = eval_cols(cols, itr, ite)
        total += len(ite)
        diff += int((p10 != pk).sum())
    print(f"{diff} désaccords sur {total} décisions appariées")


if __name__ == "__main__":
    separation_par_paire()
    res = selection_imbriquee()
    desaccords(res)
