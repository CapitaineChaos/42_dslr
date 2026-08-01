"""The maximum of four affine scores is a four-sided roof; its shadow is the
partition of the plane into four regions."""
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
plt.rcParams.update({'font.family': 'serif', 'font.size': 11, 'axes.labelcolor': INK,
                     'text.color': INK})

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

LIM = 2.2
g = np.linspace(-LIM, LIM, 260)
GX, GY = np.meshgrid(g, g)
Z = np.stack([W[m][0] + W[m][1] * GX + W[m][2] * GY for m in HOUSES])
gagnante = Z.argmax(axis=0)
toit = Z.max(axis=0)

fig = plt.figure(figsize=(11.5, 9.2))
ax = fig.add_subplot(111, projection='3d')

# Le toit : une facette par maison, coloree par le modele qui l'emporte.
teintes = np.empty(gagnante.shape + (4,))
for k, maison in enumerate(HOUSES):
    rgba = np.array(matplotlib.colors.to_rgba(COUL[maison]))
    rgba[3] = 0.93
    teintes[gagnante == k] = rgba
ax.plot_surface(GX, GY, toit, facecolors=teintes, rstride=2, cstride=2,
                linewidth=0, antialiased=True, shade=True, zorder=3)

SOL = -16.0
# L'ombre du toit : le decoupage du plan, aux memes couleurs.
ax.contourf(GX, GY, gagnante, levels=[-.5, .5, 1.5, 2.5, 3.5],
            colors=[COUL[m] for m in HOUSES], alpha=.30,
            zdir='z', offset=SOL, zorder=1)
# Les aretes du toit, et leur projection : ce sont les limites des regions.
ax.contour(GX, GY, gagnante, levels=[.5, 1.5, 2.5], colors=[INK],
           linewidths=1.6, zdir='z', offset=SOL, zorder=2)

for k, maison in enumerate(HOUSES):
    sel = (maisons == maison) & (np.abs(x1) < LIM) & (np.abs(x2) < LIM)
    ax.scatter(x1[sel][::4], x2[sel][::4], SOL + 0.05, s=5,
               color=COUL[maison], alpha=.55, linewidths=0, zorder=2)

# Les aretes du toit, tracees puis rabattues au sol par une verticale : c'est
# ce trajet qui relie le pli de la surface a la limite entre deux regions.
ecart = np.abs(np.sort(Z, axis=0)[-1] - np.sort(Z, axis=0)[-2])
arete = ecart < 0.09
ax.scatter(GX[arete], GY[arete], toit[arete], s=1.4, color=INK, alpha=.85, zorder=6)

# Le point ou les quatre pans se rejoignent : les quatre scores y sont egaux.
centre = np.unravel_index(np.argmin(Z.max(axis=0) - Z.min(axis=0)), GX.shape)
cx, cy, cz = GX[centre], GY[centre], toit[centre]
ax.plot([cx, cx], [cy, cy], [SOL, cz], color=INK, lw=1.3, ls=(0, (4, 3)), zorder=7)
ax.scatter([cx], [cy], [cz], s=34, color='white', edgecolor=INK, linewidth=1.4, zorder=8)
ax.scatter([cx], [cy], [SOL + 0.1], s=34, color='white', edgecolor=INK,
           linewidth=1.4, zorder=8)
ax.text(cx + 0.12, cy - 0.30, SOL + 0.4, 'les quatre scores y sont égaux',
        fontsize=10, color=INK, zorder=9)
print(f"point triple : ({cx:+.3f}, {cy:+.3f}), score commun {cz:+.3f}")

ax.set_xlabel('Herbology', labelpad=12)
ax.set_ylabel('Ancient Runes', labelpad=12)
ax.set_zlabel('score $z_k$', labelpad=10)
ax.set_zlim(SOL, 12)
ax.set_box_aspect((1, 1, 0.82), zoom=1.06)
ax.view_init(elev=26, azim=-58)
ax.xaxis.pane.fill = ax.yaxis.pane.fill = ax.zaxis.pane.fill = False
for a in (ax.xaxis, ax.yaxis, ax.zaxis):
    a.pane.set_edgecolor('#D5DBE1')
    a._axinfo["grid"]['color'] = '#E8ECEF'

ANCRE = {'Gryffindor': (-1.7, 1.7), 'Ravenclaw': (1.7, 1.7),
         'Slytherin': (-1.7, -1.7), 'Hufflepuff': (1.55, -2.05)}
for maison, (px, py) in ANCRE.items():
    k = HOUSES.index(maison)
    h = W[maison][0] + W[maison][1] * px + W[maison][2] * py
    ax.text(px, py, h + 1.4, maison, color=COUL[maison], fontsize=11,
            ha='center', weight='bold', zorder=10)

ax.set_title("le maximum des quatre scores : un toit à quatre pans,\n"
             "dont l'ombre au sol est le découpage en régions",
             fontsize=13, pad=4)
fig.tight_layout()
fig.savefig(f'{OUT}/toit.png', dpi=200)
print('toit.png ecrit')
for maison in HOUSES:
    print(f"{maison:<12} w = " + "  ".join(f"{v:+.3f}" for v in W[maison]))
