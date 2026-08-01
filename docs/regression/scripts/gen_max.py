"""From four scores to four regions : a cut across the plane, the four affine
scores along it, and their upper envelope."""
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
SHORT = {'Gryffindor': 'G', 'Hufflepuff': 'H', 'Ravenclaw': 'R', 'Slytherin': 'S'}
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
for maison in HOUSES:
    cible = (maisons == maison).astype(float)
    w = np.zeros(3)
    for _ in range(600):
        w -= 1.0 * (X.T @ (sigmoide(X @ w) - cible) / len(X))
    W[maison] = w

# The cut is chosen among a few candidates : the one crossing the most regions.
CANDIDATES = {'horizontale x2=1': ((-3, 1), (3, 1)),
              'horizontale x2=0': ((-3, 0), (3, 0)),
              'oblique': ((-2.2, 1.35), (2.2, -0.55)),
              'oblique basse': ((-2.8, 1.2), (2.8, -2.2))}
t = np.linspace(0, 1, 600)
best = None
for label, ((ax, ay), (bx, by)) in CANDIDATES.items():
    cx, cy = ax + (bx - ax) * t, ay + (by - ay) * t
    scores = np.stack([W[m][0] + W[m][1] * cx + W[m][2] * cy for m in HOUSES])
    win = scores.argmax(axis=0)
    crossed = len(set(win))
    changes = int((np.diff(win) != 0).sum())
    print(f"{label:<18} traverse {crossed} regions, {changes} basculements "
          f"({' '.join(dict.fromkeys(SHORT[HOUSES[k]] for k in win))})")
    if label == 'oblique':      # crosses three regions well inside each of them
        best = (changes, label, (ax, ay), (bx, by))

_, LABEL, (AX, AY), (BX, BY) = best
print(f"coupe retenue : {LABEL}")
cx, cy = AX + (BX - AX) * t, AY + (BY - AY) * t
scores = np.stack([W[m][0] + W[m][1] * cx + W[m][2] * cy for m in HOUSES])
win = scores.argmax(axis=0)
enveloppe = scores.max(axis=0)
bascules = [i for i in range(1, len(t)) if win[i] != win[i - 1]]

gx = np.linspace(-3, 3, 400)
GX, GY = np.meshgrid(gx, gx)
Z = np.stack([W[m][0] + W[m][1] * GX + W[m][2] * GY for m in HOUSES])
gagnante = Z.argmax(axis=0)

fig, (axA, axB) = plt.subplots(1, 2, figsize=(12.4, 5.4),
                               gridspec_kw={'width_ratios': [1, 1.22]})

axA.pcolormesh(GX, GY, gagnante, shading='auto',
               cmap=ListedColormap([COUL[m] for m in HOUSES]), alpha=.20)
for maison in HOUSES:
    sel = maisons == maison
    axA.scatter(x1[sel], x2[sel], s=4, color=COUL[maison], alpha=.35, linewidths=0)
axA.plot([AX, BX], [AY, BY], color='white', lw=3.4, zorder=4)
axA.plot([AX, BX], [AY, BY], color=INK, lw=1.6, zorder=5)
for i in bascules:
    axA.plot(cx[i], cy[i], 'o', ms=8, mfc='white', mec=INK, mew=1.8, zorder=6)
axA.text(AX, AY + .22, 'A', ha='center', fontsize=12, color=INK, weight='bold')
axA.text(BX, BY - .40, 'B', ha='center', fontsize=12, color=INK, weight='bold')
axA.set_xlim(-3, 3); axA.set_ylim(-3, 3); axA.set_aspect('equal')
axA.set_xlabel('Herbology'); axA.set_ylabel('Ancient Runes')
axA.grid(color='#E2E7EC', lw=.5)
axA.set_title('un trajet A $\\rightarrow$ B qui traverse trois régions', fontsize=11)

bornes = [0] + bascules + [len(t) - 1]
for deb, fin_i in zip(bornes[:-1], bornes[1:]):
    axB.axvspan(t[deb], t[fin_i], color=COUL[HOUSES[win[deb]]], alpha=.13, lw=0)
    axB.text((t[deb] + t[fin_i]) / 2, 0.985, SHORT[HOUSES[win[deb]]],
             transform=axB.get_xaxis_transform(), ha='center', va='top',
             fontsize=12, weight='bold', color=COUL[HOUSES[win[deb]]])
for k, maison in enumerate(HOUSES):
    gagne = win == k
    axB.plot(t, scores[k], color=COUL[maison], lw=1.3, alpha=.55)
    if gagne.any():
        seg = np.where(gagne, scores[k], np.nan)
        axB.plot(t, seg, color=COUL[maison], lw=3.6, solid_capstyle='round')
    fin = scores[k][-1]
    axB.text(1.012, fin, SHORT[maison], color=COUL[maison], fontsize=11,
             va='center', weight='bold')
for i in bascules:
    axB.axvline(t[i], color=INK, lw=.9, ls=(0, (3, 3)), alpha=.6)
    axB.plot(t[i], enveloppe[i], 'o', ms=8, mfc='white', mec=INK, mew=1.8, zorder=6)
axB.set_xlim(0, 1.05)
axB.set_xticks([0, 1]); axB.set_xticklabels(['A', 'B'])
axB.set_ylabel('score $z_k$ le long du trajet')
axB.grid(color='#E2E7EC', lw=.5)
axB.axhline(0, color='#8895A0', lw=.8)
axB.set_title('les quatre scores le long du trajet ; le plus grand en trait épais',
              fontsize=11)

fig.tight_layout()
fig.savefig(f'{OUT}/score_max.png', dpi=200)
print('score_max.png ecrit')

print()
for maison in HOUSES:
    print(f"{maison:<12} w = " + "  ".join(f"{v:+.3f}" for v in W[maison]))
print()
for i in bascules:
    a, b = HOUSES[win[i - 1]], HOUSES[win[i]]
    print(f"bascule {SHORT[a]} -> {SHORT[b]} en "
          f"({cx[i]:+.3f}, {cy[i]:+.3f}), scores egaux a {enveloppe[i]:+.3f}")
    d = W[a] - W[b]
    print(f"   difference des coefficients : " + "  ".join(f"{v:+.3f}" for v in d))
