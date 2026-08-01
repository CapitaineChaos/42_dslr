"""What moving the decision threshold trades : one kind of error for the other."""
import matplotlib
matplotlib.use('Agg')
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(ROOT, 'V.0_Common')]
DATASETS = os.path.join(ROOT, 'datasets')
OUT = os.path.join(HERE, '..', 'figures')
import numpy as np
import matplotlib.pyplot as plt
from dataset import Data

INK = '#18212B'
GRYFF = '#155E75'
OTHER = '#9A3412'
plt.rcParams.update({'font.family': 'serif', 'font.size': 11.5, 'axes.labelcolor': INK,
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
houses = np.array(data.houses)
is_gryff = houses == "Gryffindor"
W = (-4.7454, -3.4535, 3.4688)
z = W[0] + W[1] * x1 + W[2] * x2
p = 1 / (1 + np.exp(-z))

seuils = np.linspace(0.02, 0.98, 300)
manques = [(p[is_gryff] < s).sum() for s in seuils]          # Gryffindor missed
intrus = [(p[~is_gryff] >= s).sum() for s in seuils]         # others called Gryffindor
total = [a + b for a, b in zip(manques, intrus)]
best = int(np.argmin(total))

# Les deux panneaux partagent l'axe des abscisses : la verticale du seuil se
# lit sur les deux a la fois.
fig, (axA, axB) = plt.subplots(2, 1, figsize=(10.5, 9.4), sharex=True,
                               gridspec_kw={'height_ratios': [1.15, 1],
                                            'hspace': 0.20})

bins = np.linspace(0, 1, 46)
axA.hist(p[~is_gryff], bins=bins, color=OTHER, alpha=.55, label='trois autres maisons')
axA.hist(p[is_gryff], bins=bins, color=GRYFF, alpha=.75, label='Gryffindor')
axA.axvline(0.5, color=INK, lw=1.8)
axA.set_yscale('log')
axA.set_xlim(0, 1)
axA.set_ylabel('élèves (échelle logarithmique)', fontsize=11)
axA.set_ylim(0.7, 4000)
axA.legend(frameon=False, fontsize=10.5, loc='upper right')
axA.set_title('les probabilités rendues par le modèle, et un seuil de $0{,}5$',
              fontsize=12.5, pad=10)
# les portions en erreur sont rehaussees d'un contour hachure
axA.hist(p[is_gryff][p[is_gryff] < 0.5], bins=bins, facecolor='none',
         edgecolor=GRYFF, hatch='///', lw=1.2)
axA.hist(p[~is_gryff][p[~is_gryff] >= 0.5], bins=bins, facecolor='none',
         edgecolor=OTHER, hatch='\\\\\\', lw=1.2)
axA.annotate('24 Gryffindor manqués', xy=(0.30, 1.6), xytext=(0.10, 90),
             fontsize=10.5, color=GRYFF, ha='left',
             arrowprops=dict(arrowstyle='->', color=GRYFF, lw=1.1,
                             connectionstyle='arc3,rad=-0.2'))
axA.annotate('12 élèves désignés à tort', xy=(0.62, 1.6), xytext=(0.50, 90),
             fontsize=10.5, color=OTHER, ha='left',
             arrowprops=dict(arrowstyle='->', color=OTHER, lw=1.1,
                             connectionstyle='arc3,rad=0.2'))

axB.plot(seuils, manques, color=GRYFF, lw=2.2, label='Gryffindor manqués')
axB.plot(seuils, intrus, color=OTHER, lw=2.2, label='élèves désignés à tort')
axB.plot(seuils, total, color=INK, lw=1.4, ls='--', label='total')
axB.axvline(0.5, color=INK, lw=.9, alpha=.5)
axB.plot(seuils[best], total[best], 'o', ms=7, mfc='white', mec=INK, mew=1.7)
axB.set_xlim(0, 1)
axB.set_ylim(0, 90)
axB.set_xlabel('seuil appliqué à la probabilité', fontsize=11)
axB.set_ylabel("nombre d'erreurs", fontsize=11)
axB.legend(frameon=False, fontsize=10.5, loc='upper center')
axB.set_title("ce que devient chaque erreur quand le seuil se déplace",
              fontsize=12.5, pad=10)

fig.subplots_adjust(left=0.105, right=0.985, top=0.955, bottom=0.065)
fig.savefig(f'{OUT}/seuil.png', dpi=200)
print('seuil.png ecrit')

for s in (0.3, 0.5, 0.7):
    k = int(np.argmin(np.abs(seuils - s)))
    print(f"seuil {seuils[k]:.2f} : manques {manques[k]:3}  intrus {intrus[k]:3}  "
          f"total {total[k]:3}")
print(f"minimum du total : seuil {seuils[best]:.2f}, {total[best]} erreurs")
print(f"part de Gryffindor dans le fichier : {is_gryff.sum()}/{len(houses)} "
      f"= {is_gryff.mean():.4f}")

# --- Seconde figure : ce que le seuil devient dans le plan des notes ---
# Le seuil s sur la probabilite equivaut au seuil logit(s) sur le score, donc
# a la droite w0 - logit(s) + w1 x1 + w2 x2 = 0 : le biais seul est deplace.
SEUILS = [0.30, 0.50, 0.70]
STYLES = ['--', '-', ':']

fig2, ax = plt.subplots(figsize=(9.2, 8.0))
ax.scatter(x1[~is_gryff], x2[~is_gryff], s=7, color=OTHER, alpha=.28, linewidths=0,
           label='trois autres maisons')
ax.scatter(x1[is_gryff], x2[is_gryff], s=7, color=GRYFF, alpha=.55, linewidths=0,
           label='Gryffindor')

gx = np.linspace(-3, 3, 200)
TEINTES = ['#0F766E', INK, '#7C2D12']
axz = ax.inset_axes([0.60, 0.055, 0.375, 0.375], xlim=(-1.45, -0.45),
                    ylim=(0.25, 1.05))
axz.scatter(x1[~is_gryff], x2[~is_gryff], s=9, color=OTHER, alpha=.30, linewidths=0)
axz.scatter(x1[is_gryff], x2[is_gryff], s=9, color=GRYFF, alpha=.60, linewidths=0)

for seuil, style, teinte in zip(SEUILS, STYLES, TEINTES):
    decale = W[0] - np.log(seuil / (1 - seuil))
    manque = int((p[is_gryff] < seuil).sum())
    tort = int((p[~is_gryff] >= seuil).sum())
    libelle = ('seuil ' + f'{seuil:.1f}'.replace('.', ',') +
               f' : {manque + tort} erreurs')
    for cible in (ax, axz):
        cible.plot(gx, -(decale + W[1] * gx) / W[2], color=teinte, lw=2.0,
                   ls=style, zorder=5,
                   label=libelle if cible is ax else None)
    print(f"seuil {seuil:.2f} : biais equivalent {decale:+.3f}, "
          f"{manque} manques + {tort} a tort")

# logit(0,7) - logit(0,5) = log(0,7/0,3) : l'ecart de score entre deux seuils
# consecutifs, rapporte a la norme pour l'exprimer en ecarts-types.
ecart = np.log(0.7 / 0.3) / np.hypot(W[1], W[2])
print(f"ecart entre deux seuils consecutifs : {ecart:.3f} ecart-type")
axz.set_facecolor('white')
axz.set_zorder(6)
axz.patch.set_alpha(1.0)
axz.set_xticks([])
axz.set_yticks([])
for bord in axz.spines.values():
    bord.set_edgecolor('#8895A0')
ax.indicate_inset_zoom(axz, edgecolor='#8895A0', alpha=.9, lw=1.0)
axz.set_title(f'agrandissement : les trois droites\nsont distantes de '
              f'{ecart:.2f}'.replace('.', ',') + ' écart-type',
              fontsize=9.5, pad=5,
              bbox=dict(fc='white', ec='none', alpha=.92, pad=2.5))

ax.set_xlim(-3, 3.05)
ax.set_ylim(-3, 3)
ax.set_aspect('equal')
ax.set_xlabel('Herbology, en écarts-types', fontsize=11)
ax.set_ylabel('Ancient Runes, en écarts-types', fontsize=11)
ax.grid(color='#E2E7EC', lw=.5)
ax.legend(frameon=False, fontsize=10, loc='upper left')
ax.set_title('un seuil différent translate la frontière, sans la faire pivoter',
             fontsize=12.5, pad=10)
fig2.tight_layout()
fig2.savefig(f'{OUT}/seuil_plan.png', dpi=200)
print('seuil_plan.png ecrit')
