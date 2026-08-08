# Diaporama — régression logistique binaire

Livrable autonome : rien ici n'est partagé avec `../regression/`. Le cas d'étude
oppose deux maisons, Gryffondor et Serpentard, à partir de deux notes (Potions
sur 20, Vol sur 100).

## Fichiers

| fichier | rôle |
|---|---|
| `data/eleves.csv` | **source unique.** 28 élèves, notes brutes, découpage, marquage des profils atypiques |
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
ce qui rend le cas calculable à la main jusqu'au bout — et lisible à l'écran.

- **Deux agrégats compacts.** Gryffondor se concentre sur des notes de Potions
  basses et de Vol élevé, Serpentard à l'opposé. Sur la boîte de tracé (rapport
  largeur/hauteur de 1,25, imposé par `scale only axis`), chaque agrégat est un
  disque et non une traînée oblique.
- **Six observations en recouvrement.** Hermione, Colin et Alicia sont
  Gryffondor au sein de l'agrégat Serpentard ; Marcus, Millicent et Daphné
  présentent la configuration inverse. Ce recouvrement rend l'optimum fini —
  sans lui les coefficients divergeraient — et conditionne l'existence de faux
  positifs, de faux négatifs et de pertes individuelles élevées.
- **20 élèves d'apprentissage, 8 d'évaluation.** Les statistiques ne sont lues
  que sur les 20 premiers.
- **Deux notes manquantes**, une de chaque côté : Potions de Ron (E05, dans
  l'apprentissage) et Vol de George (E23, dans l'évaluation). Toutes deux sont
  remplacées par la médiane d'apprentissage — 10 et 57.
- **Statistiques rondes** après imputation : moyennes 10 et 50, écarts-types 4
  et 20, covariance −64, donc corrélation exactement −4/5. La standardisation
  `(P − 10)/4` et `(V − 50)/20` reste vérifiable sans calculatrice.

L'optimum n'a pas de forme close : le script le résout par Newton–Raphson,
vérifie que le gradient y est nul à 2·10⁻¹⁵ près, puis contrôle qu'une descente
de gradient à pas constant rejoint le même vecteur.

```
w = (+0,603740 ; -1,029417 ; +0,514094)     variables standardisées
β = (+1,892048 ; -0,257354 ; +0,025705)     notes brutes
frontière : V = 10,0120 P - 73,6071
```

Le poids de Potions vaut deux fois celui de Vol sur l'échelle standardisée ;
les intensités s'inversent sur les notes brutes, parce que les deux matières
n'ont pas la même échelle.

Aucun élève ne tombe sur un seuil de décision — le script refuse une
probabilité collée à 0,50 ou 0,65, pour qu'un résidu flottant ne décide jamais
d'une prédiction. Côté évaluation, Olivier (0,6105) et Daphné (0,5920)
basculent entre les deux seuils : même exactitude 6/8, précision 0,75 → 1,00,
rappel 0,75 → 0,50.

Modifier une note casse en général l'une de ces propriétés : le script refusera
de produire quoi que ce soit plutôt que d'écrire des valeurs fausses.
