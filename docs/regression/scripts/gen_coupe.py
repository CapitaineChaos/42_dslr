"""La nappe orientee dans l'axe de la frontiere, en regard de la sigmoide."""
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
cmap = LinearSegmentedColormap.from_list('classes',
       ['#7A2A0E', WARNING, '#D89A7A', '#F6F1EC', '#8FB3C0', ACCENT, '#0D3A48'])
plt.rcParams.update({'font.family': 'serif', 'font.size': 10, 'axes.labelcolor': INK,
                     'text.color': INK, 'xtick.color': INK, 'ytick.color': INK,
                     'axes.edgecolor': '#8895A0'})

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
COUL = {1: '#C98A5B', 10: '#8A5A3B', 400: INK}
w0, w1, w2 = W[400]
norme = (w1 ** 2 + w2 ** 2) ** .5
azim_frontiere = np.degrees(np.arctan2(-w1, w2))

fig = plt.figure(figsize=(13, 6.4))
gs = fig.add_gridspec(1, 2, width_ratios=[1.25, 1], wspace=.08)

# gauche : le graphe de la figure precedente, seul l'angle de vue change
ax = fig.add_subplot(gs[0], projection='3d', computed_zorder=False)
gx = np.linspace(-3, 3, 110)
GX, GY = np.meshgrid(gx, gx)
P = 1 / (1 + np.exp(-(w0 + w1 * GX + w2 * GY)))
SOL = -0.55
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
ax.set_box_aspect((1, 1, .95))
ax.view_init(elev=8, azim=azim_frontiere)          # seule ligne differente de la figure 4.5
ax.set_xlabel('Herbology', labelpad=-2); ax.set_ylabel('Ancient Runes', labelpad=-2)
ax.set_zlabel('probabilité annoncée', labelpad=2)
ax.tick_params(labelsize=8, pad=-2)
ax.set_title("le graphe précédent, tourné dans l'axe de la frontière",
             fontsize=11, pad=0)
ax.legend(loc='upper left', frameon=False, fontsize=9, bbox_to_anchor=(.0, .95))

# droite : le meme profil, a plat, aux trois iterations
ax2 = fig.add_subplot(gs[1])
d = np.linspace(-5, 5, 400)
for it, (a0, a1, a2) in W.items():
    n = (a1 ** 2 + a2 ** 2) ** .5
    larg = 2 * np.log(3) / n
    ax2.plot(d, 1 / (1 + np.exp(-n * d)), color=COUL[it], lw=2.4,
             label=f'itération {it}' + r'   $\|w\|=' + f'{n:.2f}$'.replace('.', ','))
ax2.axhline(.5, color='#8895A0', lw=1.2, ls=(0, (4, 2)))
ax2.axvline(0, color='#8895A0', lw=1.2, ls=(0, (4, 2)))
ax2.annotate("$d=0$ : la frontière", xy=(0, .72), xytext=(-4.8, .88), fontsize=9,
             color=INK, arrowprops=dict(arrowstyle='->', color='#8895A0', lw=1))
ax2.set_xlabel("distance à la frontière $d$, en écarts-types")
ax2.set_ylabel(r'probabilité annoncée   $p=\sigma(\|w\|\,d)$'); ax2.set_xlim(-5, 5); ax2.set_ylim(-.02, 1.02)
ax2.grid(color='#E2E7EC', lw=.5)
ax2.legend(frameon=False, fontsize=10, loc='lower right', handlelength=1.8,
           borderaxespad=1.2)
fig.savefig(f'{OUT}/coupe_sigmoide.png', dpi=200, bbox_inches='tight')
print('coupe_sigmoide.png ecrit')
print(f"azimut de la frontiere : {azim_frontiere:.1f} degres")
