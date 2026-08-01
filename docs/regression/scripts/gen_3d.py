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
from matplotlib.colors import LinearSegmentedColormap
from dataset import Data

OUT = os.path.join(HERE, '..', 'figures')
INK, ACCENT, WARNING = '#18212B', '#155E75', '#9A3412'
plt.rcParams.update({'font.family': 'serif', 'font.size': 9, 'axes.labelcolor': INK,
                     'text.color': INK, 'xtick.color': INK, 'ytick.color': INK})
# du bleu profond au fond vers le clair sur les bords : le creux se lit comme une ombre
# bleus francs, sans cyan : teinte constante, seule la clarté varie
BLEUS = ['#EAF2F8', '#C3DBEC', '#93B7D9', '#5E8FBF', '#2E6A9E']
cmap = LinearSegmentedColormap.from_list('doc', BLEUS)
cmap_p = LinearSegmentedColormap.from_list('p', BLEUS[::-1])

data = Data(os.path.join(DATASETS, 'dataset_train.csv'))
def col(name, mu, sd):
    c = data.courses[name]
    present = sorted(v for v in c if v is not None)
    med = present[len(present)//2]
    return (np.array([v if v is not None else med for v in c]) - mu) / sd
x1 = col("Herbology", 1.1890, 5.1745)
x2 = col("Ancient Runes", 495.0517, 105.1857)
y = np.array([1.0 if h == "Gryffindor" else 0.0 for h in data.houses])
X = np.column_stack([np.ones(len(x1)), x1, x2])

def cost(w):
    z = X @ w
    return np.mean(np.maximum(z, 0) + np.log1p(np.exp(-np.abs(z))) - y * z)

# trajectoire reelle
w = np.zeros(3); traj = []
for it in range(401):
    z = X @ w
    p = np.where(z >= 0, 1/(1+np.exp(-np.abs(z))), np.exp(-np.abs(z))/(1+np.exp(-np.abs(z))))
    traj.append((w.copy(), cost(w)))
    w -= 1.0 * (X.T @ (p - y) / len(X))
W0 = traj[-1][0][0]

# --- surface du cout ---
g1 = np.linspace(-6, 1.5, 70); g2 = np.linspace(-1.5, 6, 70)
G1, G2 = np.meshgrid(g1, g2)
J = np.empty_like(G1)
for i in range(G1.shape[0]):
    for k in range(G1.shape[1]):
        J[i, k] = cost(np.array([W0, G1[i, k], G2[i, k]]))

tw = np.array([t[0] for t in traj])
tj = np.array([cost(np.array([W0, a, b])) for a, b in zip(tw[:, 1], tw[:, 2])])

# --- surface seule, pleine page ---
fig = plt.figure(figsize=(9.4, 8.4))
ax = fig.add_subplot(111, projection='3d', computed_zorder=False)
ax.plot_surface(G1, G2, J, cmap=cmap, alpha=.95, linewidth=.2,
                edgecolors='white', rstride=2, cstride=2)
ax.contour(G1, G2, J, levels=14, zdir='z', offset=-.45, cmap=cmap, linewidths=1.0)
ax.set_zlim(-.45, J.max())
ax.plot(tw[:, 1], tw[:, 2], tj + .04, color=WARNING, lw=3.4, zorder=10)
ax.scatter([0], [0], [tj[0] + .06], color=INK, s=90, zorder=12, depthshade=False)
ax.scatter([tw[-1, 1]], [tw[-1, 2]], [tj[-1] + .06], color=WARNING, s=120,
           marker='X', zorder=12, depthshade=False)
# tige verticale du minimum jusqu'a sa projection sur le plan des contours
ax.plot([tw[-1, 1], tw[-1, 1]], [tw[-1, 2], tw[-1, 2]], [-.45, tj[-1] + .04],
        color=WARNING, ls=(0, (3, 3)), lw=1.5, zorder=11)
ax.scatter([tw[-1, 1]], [tw[-1, 2]], [-.45], color=WARNING, s=55, marker='X',
           zorder=11, depthshade=False, alpha=.8)
ax.text(0.5, -0.4, tj[0] + .13, 'départ\n$J=0{,}98$', color=INK, fontsize=13,
        ha='center', va='bottom', zorder=13,
        bbox=dict(fc='white', ec='none', alpha=.92, pad=3))
ax.text(tw[-1, 1] + 0.2, tw[-1, 2] - 0.9, tj[-1] + .22,
        'minimum\n$J=0{,}11$', color=WARNING, fontsize=13, ha='center', va='bottom',
        zorder=13, bbox=dict(fc='white', ec='none', alpha=.92, pad=3))
ax.set_xlabel('$w_1$   Herbology', labelpad=16, fontsize=13)
ax.set_ylabel('$w_2$   Ancient Runes', labelpad=16, fontsize=13)
ax.set_zlabel('coût $J$', labelpad=18, fontsize=13, rotation=90)
ax.set_xticks([-6, -4, -2, 0]); ax.set_yticks([0, 2, 4, 6])
ax.set_zticks([0, 0.5, 1.0, 1.5])
ax.tick_params(labelsize=11, pad=4)
ax.view_init(elev=30, azim=-135)
ax.set_box_aspect((1, 1, .78), zoom=0.96)
fig.subplots_adjust(left=.06, right=.98, bottom=.08, top=1.0)
fig.savefig(f'{OUT}/surface3d.png', dpi=200)
print('surface3d.png : 9.4x8.4 pouces, elev 34, palette claire')

# --- courbes de niveau, figure separee ---
fig = plt.figure(figsize=(7.4, 6.2))
ax2 = fig.add_subplot(111)
lv = np.linspace(J.min(), J.min() + 1.35, 16)
cf = ax2.contourf(G1, G2, J, levels=lv, cmap=cmap_p, alpha=.9, extend='max')
ax2.contour(G1, G2, J, levels=lv, colors='white', linewidths=.5)
ax2.plot(tw[:, 1], tw[:, 2], color=WARNING, lw=2.6)
ax2.scatter(tw[::25, 1], tw[::25, 2], color=WARNING, s=18, zorder=5)
ax2.scatter([0], [0], color=INK, s=70, zorder=6)
ax2.annotate('départ', (0, 0), textcoords='offset points', xytext=(10, -16),
             fontsize=11, color=INK)
ax2.scatter([tw[-1, 1]], [tw[-1, 2]], color=WARNING, s=95, marker='X', zorder=6)
ax2.annotate('minimum', (tw[-1, 1], tw[-1, 2]), textcoords='offset points',
             xytext=(-70, 6), fontsize=11, color=WARNING)
ax2.set_xlabel('$w_1$  (Herbology)', fontsize=12)
ax2.set_ylabel('$w_2$  (Ancient Runes)', fontsize=12)
ax2.tick_params(labelsize=10)
ax2.set_aspect('equal')
fig.colorbar(cf, ax=ax2, shrink=.9, label='coût $J$')
fig.subplots_adjust(left=.10, right=.99, bottom=.09, top=.99)
fig.savefig(f'{OUT}/contours.png', dpi=200)
print('contours.png : courbes de niveau seules, 7.4x6.2 pouces')

# --- nappe de probabilite ---
gx = np.linspace(-3, 3, 80); gy = np.linspace(-3, 3, 80)
GX, GY = np.meshgrid(gx, gy)
SOL = -0.30
fig = plt.figure(figsize=(9.6, 4.4))
for idx, it in enumerate((1, 400)):
    wv = traj[it][0]
    P = 1 / (1 + np.exp(-(wv[0] + wv[1]*GX + wv[2]*GY)))
    ax = fig.add_subplot(1, 2, idx+1, projection='3d', computed_zorder=False)
    ax.contourf(GX, GY, P, levels=np.linspace(0, 1, 12), zdir='z', offset=SOL,
                cmap=cmap_p, alpha=.45)
    sel = slice(None, None, 4)
    ax.scatter(x1[y == 0][sel], x2[y == 0][sel], np.full(len(x1[y == 0][sel]), SOL),
               color=WARNING, s=6, alpha=.6, zorder=4, depthshade=False)
    ax.scatter(x1[y == 1][sel], x2[y == 1][sel], np.full(len(x1[y == 1][sel]), SOL),
               color=ACCENT, s=6, alpha=.95, zorder=4, depthshade=False)
    ax.plot_surface(GX, GY, P, cmap=cmap_p, alpha=.7, linewidth=.1,
                    edgecolors='white', rstride=2, cstride=2, zorder=6)
    # la ligne des 50 %, posee sur la nappe puis projetee au sol
    lx = np.linspace(-3, 3, 60)
    ly = -(wv[0] + wv[1]*lx) / wv[2]
    keep = (ly > -3) & (ly < 3)
    ax.plot(lx[keep], ly[keep], np.full(keep.sum(), .5), color=WARNING, lw=2.6, zorder=8)
    ax.plot(lx[keep], ly[keep], np.full(keep.sum(), SOL), color=WARNING, lw=1.4,
            ls=(0, (4, 2)), zorder=5)
    ax.set_zlim(SOL, 1); ax.set_zticks([0, .5, 1]); ax.set_box_aspect((1, 1, .62))
    ax.view_init(elev=22, azim=-56)
    ax.tick_params(labelsize=7, pad=-1)
    ax.set_xlabel('Herbology', labelpad=-4); ax.set_ylabel('Ancient Runes', labelpad=-4)
    ax.set_zlabel('$p$', labelpad=-6)
    ax.set_title(f'itération {it}', pad=0)
fig.subplots_adjust(left=.0, right=.98, wspace=.02, bottom=.06, top=.94)
fig.savefig(f'{OUT}/nappe3d.png', dpi=220)
print('nappe3d.png ecrit')
print('cout au depart', round(cost(np.array([W0, 0, 0])), 4), '| minimum atteint', round(traj[-1][1], 4))
