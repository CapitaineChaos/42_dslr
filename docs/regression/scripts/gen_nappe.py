"""La nappe sigmoidale au-dessus des eleves, une image par iteration."""
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
from matplotlib.colors import LinearSegmentedColormap
from dataset import Data

INK, ACCENT, WARNING = '#18212B', '#155E75', '#9A3412'
# la couleur de la nappe est celle de la classe qu'elle predit
cmap = LinearSegmentedColormap.from_list('classes',
       ['#7A2A0E', WARNING, '#D89A7A', '#F6F1EC', '#8FB3C0', ACCENT, '#0D3A48'])
plt.rcParams.update({'font.family': 'serif', 'font.size': 10, 'axes.labelcolor': INK,
                     'text.color': INK, 'xtick.color': INK, 'ytick.color': INK})

data = Data(os.path.join(DATASETS, 'dataset_train.csv'))
def col(name, mu, sd):
    c = data.courses[name]
    present = sorted(v for v in c if v is not None)
    med = present[len(present) // 2]
    return (np.array([v if v is not None else med for v in c]) - mu) / sd
x1 = col("Herbology", 1.1890, 5.1745)
x2 = col("Ancient Runes", 495.0517, 105.1857)
y = np.array([1.0 if h == "Gryffindor" else 0.0 for h in data.houses])

W = {1: (-0.2956, -0.2289, 0.1924), 10: (-1.3952, -1.0678, 0.9338),
     400: (-4.7454, -3.4535, 3.4688)}
gx = np.linspace(-3, 3, 110)
GX, GY = np.meshgrid(gx, gx)
SOL = -0.55

for it, (w0, w1, w2) in W.items():
    P = 1 / (1 + np.exp(-(w0 + w1 * GX + w2 * GY)))
    fig = plt.figure(figsize=(10, 8.6))
    ax = fig.add_subplot(111, projection='3d', computed_zorder=False)
    ax.contourf(GX, GY, P, levels=np.linspace(0, 1, 24), zdir='z', offset=SOL,
                cmap=cmap, alpha=.20)
    ax.scatter(x1[y == 0], x2[y == 0], np.full((y == 0).sum(), SOL),
               color=WARNING, s=13, alpha=.6, zorder=4, depthshade=False,
               label='les trois autres maisons')
    ax.scatter(x1[y == 1], x2[y == 1], np.full((y == 1).sum(), SOL),
               color=ACCENT, s=13, alpha=1.0, zorder=4, depthshade=False,
               label='Gryffindor')
    ax.plot_surface(GX, GY, P, cmap=cmap, alpha=.45, linewidth=.08,
                    edgecolors='white', rstride=3, cstride=3, zorder=6)
    lx = np.linspace(-3, 3, 80)
    ly = -(w0 + w1 * lx) / w2
    keep = (ly > -3) & (ly < 3)
    ax.plot(lx[keep], ly[keep], np.full(keep.sum(), .5), color=INK, lw=3, zorder=9)
    ax.plot(lx[keep], ly[keep], np.full(keep.sum(), SOL), color=INK, lw=1.6,
            ls=(0, (5, 3)), zorder=5)
    ax.set_zlim(SOL, 1); ax.set_zticks([0, .5, 1])
    ax.set_box_aspect((1, 1, .62)); ax.view_init(elev=32, azim=-58)
    ax.set_xlabel('Herbology', labelpad=10, fontsize=12)
    ax.set_ylabel('Ancient Runes', labelpad=10, fontsize=12)
    ax.set_zlabel('probabilité annoncée', labelpad=4, fontsize=12)
    norme = (w1 ** 2 + w2 ** 2) ** .5
    ax.set_title(f"itération {it}   —   transition sur {2 * np.log(3) / norme:.2f} écart-type"
                 .replace('.', ','), pad=2, fontsize=16)
    ax.legend(loc='upper left', frameon=False, fontsize=12, bbox_to_anchor=(.0, .90))
    fig.subplots_adjust(left=.0, right=1.0, bottom=.0, top=.97)
    fig.savefig(f'{OUT}/nappe_it{it}.png', dpi=200)
    plt.close(fig)
    print(f'nappe_it{it}.png ecrit')
