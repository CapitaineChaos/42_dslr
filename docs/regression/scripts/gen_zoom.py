import matplotlib
matplotlib.use('Agg')
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.3_Logistic_regression'), os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from dataset import Data

OUT = os.path.join(HERE, '..', 'figures')
INK, ACCENT, WARNING = '#18212B', '#155E75', '#9A3412'
plt.rcParams.update({'font.family': 'serif', 'font.size': 9, 'axes.labelcolor': INK,
                     'text.color': INK, 'xtick.color': INK, 'ytick.color': INK,
                     'axes.edgecolor': '#8895A0'})

data = Data(os.path.join(DATASETS, 'dataset_train.csv'))
def col(name, mu, sd):
    c = data.courses[name]
    present = sorted(v for v in c if v is not None)
    med = present[len(present)//2]
    return (np.array([v if v is not None else med for v in c]) - mu) / sd
x1 = col("Herbology", 1.1890, 5.1745)
x2 = col("Ancient Runes", 495.0517, 105.1857)
y = np.array([1.0 if h == "Gryffindor" else 0.0 for h in data.houses])

W = {1: (-0.2956, -0.2289, 0.1924), 10: (-1.3952, -1.0678, 0.9338),
     400: (-4.7454, -3.4535, 3.4688)}
shades = ['#C98A5B', '#8A5A3B', INK]

ZX, ZY = (-3.0, -2.0), (-1.85, -1.05)
fig, (axA, axB) = plt.subplots(1, 2, figsize=(10, 4.4),
                               gridspec_kw={'width_ratios': [1.15, 1]})
for ax, (xl, yl), title in ((axA, ((-3, 3), (-3, 3)), "vue d'ensemble"),
                            (axB, (ZX, ZY), "le même coin, agrandi")):
    ax.scatter(x1[y == 0], x2[y == 0], s=7, color=WARNING, alpha=.30, linewidths=0)
    ax.scatter(x1[y == 1], x2[y == 1], s=7, color=ACCENT, alpha=.55, linewidths=0)
    gx = np.linspace(xl[0] - 1, xl[1] + 1, 2)
    for (it, (w0, w1, w2)), c in zip(W.items(), shades):
        ax.plot(gx, (-w0 - w1 * gx) / w2, color=c, lw=2.2)
    ax.set_xlim(*xl); ax.set_ylim(*yl)
    ax.set_xlabel('Herbology'); ax.set_title(title, fontsize=10)
    ax.grid(color='#D8DEE4', lw=.5)
axA.set_ylabel('Ancient Runes')
axA.add_patch(Rectangle((ZX[0], ZY[0]), ZX[1] - ZX[0], ZY[1] - ZY[0],
                        fill=False, ec=INK, lw=1.4, ls=(0, (4, 2)), zorder=6))
axA.annotate('agrandi\nà droite', xy=(ZX[1], (ZY[0] + ZY[1]) / 2), xytext=(-1.0, -2.5),
             fontsize=8, color=INK, ha='center',
             arrowprops=dict(arrowstyle='->', color=INK, lw=1))
for (it, (w0, w1, w2)), c in zip(W.items(), shades):
    xt = -2.5
    axB.text(xt, (-w0 - w1 * xt) / w2 + .02, f'itération {it}', color=c, fontsize=9,
             va='bottom', ha='center', fontweight='bold',
             bbox=dict(fc='white', ec='none', alpha=.8, pad=1.2))
axB.annotate('', xy=(-2.5, -1.121), xytext=(-2.5, -1.438),
             arrowprops=dict(arrowstyle='<->', color=INK, lw=1.2))
axB.text(-2.46, -1.28, "0,32 écart-type\nde déplacement", fontsize=8, color=INK, va='center')
fig.tight_layout()
fig.savefig(f'{OUT}/zoom_droite.png', dpi=220)
print('zoom_droite.png ecrit')
for it, (w0, w1, w2) in W.items():
    print(f"iteration {it:>3} : pente {-w1/w2:+.4f}   hauteur en x=-2,3 : {(-w0 + w1*2.3)/w2:+.4f}")
