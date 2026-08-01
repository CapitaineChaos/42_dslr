"""Quatre modeles un-contre-tous sur deux matieres : frontieres et regions."""
import matplotlib
matplotlib.use('Agg')
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')
OUT = os.path.join(HERE, '..', 'figures')
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from dataset import Data, HOUSES

INK = '#18212B'
COUL = {'Gryffindor': '#155E75', 'Hufflepuff': '#9A3412',
        'Ravenclaw': '#4D7C0F', 'Slytherin': '#6B21A8'}
plt.rcParams.update({'font.family': 'serif', 'font.size': 10, 'axes.labelcolor': INK,
                     'text.color': INK, 'xtick.color': INK, 'ytick.color': INK,
                     'axes.edgecolor': '#8895A0'})

data = Data(os.path.join(DATASETS, 'dataset_train.csv'))
def col(name):
    c = data.courses[name]
    present = sorted(v for v in c if v is not None)
    med = present[len(present) // 2]
    v = np.array([x if x is not None else med for x in c])
    return (v - v.mean()) / v.std()
x1, x2 = col("Herbology"), col("Ancient Runes")
X = np.column_stack([np.ones(len(x1)), x1, x2])
maisons = np.array(data.houses)

def sigmoide(z):
    return np.where(z >= 0, 1 / (1 + np.exp(-np.abs(z))),
                    np.exp(-np.abs(z)) / (1 + np.exp(-np.abs(z))))

W = {}
for maison in HOUSES:                      # une descente par maison
    cible = (maisons == maison).astype(float)
    w = np.zeros(3)
    for _ in range(600):
        w -= 1.0 * (X.T @ (sigmoide(X @ w) - cible) / len(X))
    W[maison] = w
    print(f"{maison:<12} w = " + "  ".join(f"{v:+.3f}" for v in w))

gx = np.linspace(-3, 3, 400)
GX, GY = np.meshgrid(gx, gx)
Z = np.stack([W[m][0] + W[m][1] * GX + W[m][2] * GY for m in HOUSES])
gagnante = Z.argmax(axis=0)

fig, (axA, axB) = plt.subplots(1, 2, figsize=(11.5, 5.2))
for maison in HOUSES:
    w = W[maison]
    axA.plot(gx, -(w[0] + w[1] * gx) / w[2], color=COUL[maison], lw=2.2, label=maison)
    sel = maisons == maison
    axA.scatter(x1[sel], x2[sel], s=5, color=COUL[maison], alpha=.28, linewidths=0)
axA.set_xlim(-3, 3); axA.set_ylim(-3, 3); axA.set_aspect('equal')
axA.set_xlabel('Herbology'); axA.set_ylabel('Ancient Runes')
axA.grid(color='#E2E7EC', lw=.5)
axA.legend(frameon=False, fontsize=9, loc='lower left', ncol=2)
axA.set_title('quatre frontières, une par maison', fontsize=11)

axB.pcolormesh(GX, GY, gagnante, shading='auto',
               cmap=ListedColormap([COUL[m] for m in HOUSES]), alpha=.22)
for maison in HOUSES:
    sel = maisons == maison
    axB.scatter(x1[sel], x2[sel], s=5, color=COUL[maison], alpha=.55, linewidths=0)
axB.set_xlim(-3, 3); axB.set_ylim(-3, 3); axB.set_aspect('equal')
axB.set_xlabel('Herbology'); axB.set_yticklabels([])
axB.set_title('le score le plus grand gagne', fontsize=11)
ANCRE = {'Gryffindor': (-1.4, 1.9), 'Ravenclaw': (1.3, 1.9),
         'Slytherin': (-1.4, -1.9), 'Hufflepuff': (1.3, -1.9)}
for maison, (px, py) in ANCRE.items():
    axB.text(px, py, maison, color=COUL[maison], fontsize=11, ha='center',
             bbox=dict(fc='white', ec='none', alpha=.8, pad=2))
fig.tight_layout()
fig.savefig(f'{OUT}/regions_ovr.png', dpi=200)
print('regions_ovr.png ecrit')

pred = np.array(HOUSES)[Z.argmax(axis=0).ravel()[:0]] if False else None
Zel = np.stack([W[m][0] + W[m][1] * x1 + W[m][2] * x2 for m in HOUSES])
justes = (np.array(HOUSES)[Zel.argmax(axis=0)] == maisons).sum()
print(f"{justes}/{len(maisons)} = {justes/len(maisons):.4f} avec deux matieres")
