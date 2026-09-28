# dslr

Régression logistique one-vs-all qui répartit les élèves de Poudlard entre les quatre maisons.

## Installation

```bash
make install
```

Crée `.venv`, y installe matplotlib, numpy, pandas et le package `dslr` en mode éditable. Les programmes se lancent avec `.venv/bin/python` ou par `make`.

## Commandes

| make | programme | rôle |
|---|---|---|
| `make describe` | `programs/describe.py dataset.csv` | statistiques de chaque matière, calculées à la main |
| `make histogram` | `programs/histogram.py dataset_train.csv` | la matière homogène entre les maisons : Arithmancy |
| `make histograms` | `programs/histograms.py dataset_train.csv` | les 13 matières, avec leur η² |
| `make scatter` | `programs/scatter_plot.py dataset_train.csv` | les deux matières similaires : Astronomy, Defense Against the Dark Arts |
| `make scatters` | `programs/scatter_plots.py dataset_train.csv` | les 78 paires, clic pour agrandir |
| `make pair` | `programs/pair_plot.py dataset_train.csv` | pair plot, clic pour agrandir |
| `make train` | `programs/logreg_train.py dataset_train.csv` | descente de gradient, écrit `weights.csv` |
| `make predict` | `programs/logreg_predict.py dataset_test.csv weights.csv` | écrit `houses.csv` |

Analyses :

| make | programme | rôle |
|---|---|---|
| `make heatmap` | `programs/heatmap.py dataset.csv` | corrélations de Pearson entre matières |
| `make cross` | `programs/cross_validation.py dataset_train.csv` | validation croisée en 5 parts, matrice de confusion |
| | `programs/confusion_matrix.py houses.csv truth.csv` | compare des prédictions à des maisons connues |

## Code

| module | rôle |
|---|---|
| `dslr/data.py` | lecture et contrôle des CSV, colonnes de matières, colonne des maisons |
| `dslr/stats.py` | count, mean, std, min, percentiles, max |
| `dslr/model.py` | préparation des notes, descente de gradient, prédiction, lecture et écriture de `weights.csv` |
| `dslr/plots.py` | histogrammes, nuages, matrices, heatmaps |
| `dslr/analysis.py` | η², Pearson, découpage en parts, matrice de confusion, scores |

Les programmes de `programs/` lisent les arguments, appellent ces modules et affichent.

Matières utilisées par le modèle : les 13 sauf Arithmancy et Care of Magical Creatures (η² ≈ 0, aucune séparation des maisons) et Defense Against the Dark Arts (exactement -100 × Astronomy).
