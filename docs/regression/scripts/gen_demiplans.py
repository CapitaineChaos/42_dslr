"""Why the region of a house is a convex polygon: it is the intersection of the
three half-planes where its score beats each rival."""
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
plt.rcParams.update({'font.family': 'serif', 'font.size': 10.5, 'axes.labelcolor': INK,
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
for maison in HOUSES:
    cible = (maisons == maison).astype(float)
    w = np.zeros(3)
    for _ in range(600):
        w -= 1.0 * (X.T @ (sigmoide(X @ w) - cible) / len(X))
    W[maison] = w

LIM = 3.0
g = np.linspace(-LIM, LIM, 500)
GX, GY = np.meshgrid(g, g)
Z = {m: W[m][0] + W[m][1] * GX + W[m][2] * GY for m in HOUSES}
CIBLE = 'Gryffindor'
RIVAUX = [m for m in HOUSES if m != CIBLE]

fig, axes = plt.subplots(1, 4, figsize=(15.4, 4.5))


def decor(ax, titre):
    ax.set_xlim(-LIM, LIM)
    ax.set_ylim(-LIM, LIM)
    ax.set_aspect('equal')
    ax.set_xlabel('Herbology', fontsize=10)
    ax.grid(color='#E8ECEF', lw=.5)
    ax.set_title(titre, fontsize=11, pad=8)


def droite(ax, a, b, **kw):
    """Trace la droite z_a = z_b, frontiere du demi-plan ou a l'emporte."""
    d = W[a] - W[b]
    if abs(d[2]) > 1e-9:
        ax.plot(g, -(d[0] + d[1] * g) / d[2], **kw)
    else:
        ax.axvline(-d[0] / d[1], **kw)


for k, rival in enumerate(RIVAUX):
    ax = axes[k]
    gagne = Z[CIBLE] >= Z[rival]
    ax.contourf(GX, GY, gagne.astype(float), levels=[.5, 1.5],
                colors=[COUL[CIBLE]], alpha=.20)
    droite(ax, CIBLE, rival, color=INK, lw=1.8)
    decor(ax, f'$z_G \\geq z_{rival[0]}$')
    ax.text(-2.8, 2.55, f'{CIBLE}\nl\'emporte sur\n{rival}', fontsize=9.5,
            color=COUL[CIBLE], va='top')
    if k == 0:
        ax.set_ylabel('Ancient Runes', fontsize=10)
    else:
        ax.set_yticklabels([])

ax = axes[3]
region = (Z[CIBLE] >= Z[RIVAUX[0]]) & (Z[CIBLE] >= Z[RIVAUX[1]]) & (Z[CIBLE] >= Z[RIVAUX[2]])
ax.contourf(GX, GY, region.astype(float), levels=[.5, 1.5],
            colors=[COUL[CIBLE]], alpha=.42)
for rival in RIVAUX:
    droite(ax, CIBLE, rival, color=INK, lw=1.4, alpha=.55)
sel = maisons == CIBLE
ax.scatter(x1[sel], x2[sel], s=5, color=COUL[CIBLE], alpha=.55, linewidths=0)
decor(ax, 'les trois à la fois')
ax.set_yticklabels([])
ax.text(-2.8, 2.55, 'région de\nGryffindor', fontsize=9.5,
        color=COUL[CIBLE], va='top', weight='bold')

fig.tight_layout()
fig.savefig(f'{OUT}/demiplans.png', dpi=200)
print('demiplans.png ecrit')

for rival in RIVAUX:
    d = W[CIBLE] - W[rival]
    print(f"z_G - z_{rival[0]} : " + "  ".join(f"{v:+.3f}" for v in d))
aire = region.mean() * (2 * LIM) ** 2
print(f"aire de la region de {CIBLE} dans le cadre : {aire:.2f} sur {(2*LIM)**2:.0f}")
