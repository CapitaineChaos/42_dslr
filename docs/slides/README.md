# Diaporama — régression logistique binaire

Livrable autonome : rien ici n'est partagé avec `../regression/`. Le cas d'étude
oppose deux maisons, Gryffondor et Serpentard, à partir de deux notes (Potions
sur 20, Vol sur 100).

## Fichiers

| fichier | rôle |
|---|---|
| `data/eleves.csv` | **source unique.** 24 élèves, notes brutes, découpage, décalages d'étiquettes |
| `scripts/construire_cas.py` | valide le CSV, impute, standardise, ajuste le modèle, écrit `valeurs.tex` et `data/calculs.csv` |
| `scripts/assembler_corps.py` | contrôle la structure éditoriale, écrit `corps.tex` |
| `contenu.tex` | contenu éditorial : titres, textes, schémas TikZ |
| `diaporama.tex` | préambule Beamer 16:9, thème, palette |
| `valeurs.tex` | **généré.** Toutes les valeurs numériques affichées |
| `corps.tex` | **généré.** Deux `\input`, rien d'autre |
| `data/calculs.csv` | **généré.** Score, probabilité, perte et prédiction par élève |

Les quatre fichiers marqués *généré* ne se modifient jamais à la main : ils sont
réécrits à chaque construction. Pour changer un nombre affiché, changer le CSV.

## Construire

```
make -C docs slides      # génère puis compile -> slides/diaporama.pdf
```

Depuis ce dossier, sans Make :

```
python3 scripts/construire_cas.py
python3 scripts/assembler_corps.py
latexmk -pdf diaporama.tex
```

`construire_cas.py` n'emploie que la bibliothèque standard.

## Le jeu de données n'est pas arbitraire

`construire_cas.py` s'arrête si l'une de ces propriétés est rompue. Elles sont
ce qui rend le cas calculable à la main jusqu'au bout.

- **16 élèves d'apprentissage, 8 d'évaluation.** Les statistiques ne sont lues
  que sur les 16 premiers.
- **Deux notes manquantes**, une de chaque côté : Potions de Ron (E05, dans
  l'apprentissage) et Vol de George (E20, dans l'évaluation). Toutes deux sont
  remplacées par la médiane d'apprentissage — 10 et 57.
- **Statistiques rondes** après imputation : moyennes 10 et 50, écarts-types 4
  et 20.
- **Trois paliers de marge.** Avec `m = V - 2P - 18`, l'apprentissage ne prend
  que `m = -12` (4 élèves, 1 Gryffondor), `m = 0` (2 élèves, 1) et `m = +24`
  (10 élèves, 9). Les proportions valent donc 1/4, 1/2 et 9/10, dont les logits
  `-ln3`, `0` et `+2ln3` sont proportionnels à la marge.

Il en découle un optimum en forme close, que le script vérifie contre une
descente de gradient :

```
z = (ln3 / 12) (V - 2P - 18)
w = (ln3 ; -2ln3/3 ; +5ln3/3)        variables standardisées
β = (-3ln3/2 ; -ln3/6 ; +ln3/12)     notes brutes
```

L'ordonnée à l'origine est non nulle et les deux poids ont des intensités
différentes : la frontière ne passe ni par le barycentre, ni le long d'une
bissectrice. Elle vaut `x_vol = 0,4 x_pot - 0,6` en coordonnées standardisées.

Vincent et Seamus tombent exactement sur la frontière (`p = 0,50`) : c'est
voulu, et le script fige ce cas pour qu'un résidu flottant ne décide pas de leur
prédiction. Côté évaluation, Daphné (0,5456) et George (0,6125) basculent entre
les seuils 0,50 et 0,65 — même exactitude 6/8, précision 0,80 → 1,00, rappel
0,80 → 0,60.

Modifier une note sans respecter les paliers casse la forme close : le script
refusera de produire quoi que ce soit plutôt que d'écrire des valeurs fausses.
