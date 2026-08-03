# Cours « Régression logistique »

Source LaTeX du cours, ses scripts, ses données intermédiaires et ses figures.

Deux repères de lecture précèdent le cours. Le chapitre 1 commence avec la
standardisation, puis le document se lit en trois parties : un tronc commun
(partie I), un cahier pratique où chaque fonction est à écrire avant d'ouvrir
son corrigé (partie II), et douze annexes portant les démonstrations, les
rappels et les corrigés. Les figures et tableaux portent une lettre dans leur
chapitre (`figure 5-C`, `tableau 5-A`) afin de ne pas être confondus avec les
sections numérotées (`section 5.3`).

## Règle de travail sur la mise en page

Pendant les retouches de fond et de design, le nombre total de pages, les
changements de pagination et les déplacements de flottants ne constituent pas
des contraintes. La pagination finale est ajustée uniquement lorsque le
contenu et le système visuel sont stabilisés.

Le confort se juge sur une suite de pages, pas sur une capture isolée. La grille
actuelle privilégie une largeur de lecture modérée, un corps courant unique et
une hiérarchie de titres contenue. Les encadrés conservent le corps du texte :
un fond presque blanc et un filet latéral indiquent leur fonction sans créer
une seconde échelle de lecture. Les corps réduits sont réservés aux légendes,
aux relevés secondaires et au code.

## Reproduire

Depuis la racine du dépôt :

| commande | effet |
|---|---|
| `make -C docs tex-memory` | une fois par machine : redump du format `pdflatex` avec `main_memory = 12000000` |
| `make -C docs doc` | compile `regression_logistique.pdf` (latexmk + biber, PDF 2.0 balisé) |
| `make -C docs doc-tag-check` | précontrôle le balisage, les alternatives et le journal `tagpdf` |
| `make -C docs tuto` | exécute les douze fichiers du cahier pratique, dans l'ordre |
| `make -C docs verify` | recalcule toutes les valeurs numériques citées dans le document |
| `make -C docs figures` | régénère les PNG de `figures/` et les traces de `data/` |
| `make -C docs labels` | vérifie l'unicité des labels LaTeX dans les sources du document |
| `make -C docs clean` | supprime les auxiliaires LaTeX |

`make -C docs doc` ne demande que TeX Live. `make -C docs tuto` et
`make -C docs verify` n'emploient que la bibliothèque standard de Python —
aucune dépendance de calcul.

### Pourquoi `make -C docs tex-memory`

Le document est compilé en PDF balisé (`\DocumentMetadata{testphase=phase-III}`,
paquet `tagpdf`). L'arbre de structure du document entier est construit en
mémoire, ce que la taille par défaut de pdfTeX ne permet pas. La cible écrit
`main_memory = 12000000` dans `$SELFAUTOPARENT/texmf-local/web2c/texmf.cnf` et
redump le format ; l'opération se fait en espace utilisateur et se défait en
supprimant ce fichier.

## Accessibilité

Le PDF est balisé, en version 2.0, langue déclarée `fr-FR`. Ses 66 occurrences
graphiques, issues de 65 sources — images et dessins TikZ — portent chacune une
alternative textuelle.
`alt=` traite les images ; l'environnement `graphique` transmet la description
au mécanisme de balisage TikZ natif de LaTeX. Les panneaux d'une même figure
possèdent des descriptions distinctes. Le balisage est suspendu autour des
listings, dont les retours à la ligne sont posés par `listings`.

`make -C docs doc-tag-check` échoue si le PDF cesse d'être balisé, si un élément
graphique perd son alternative ou si le journal contient un avertissement
`tagpdf`. Il s'agit d'un précontrôle local. La déclaration PDF/UA-2 du document
doit encore être validée par veraPDF ou PAC avant une publication qui
revendiquerait formellement cette norme.

## Vérification des chiffres

`scripts/verifie_chiffres.py` recalcule, à partir de `datasets/dataset_train.csv`
et sans bibliothèque externe : les statistiques descriptives des deux colonnes,
les quatre états du modèle (M₀, M₄₀₀, M_arr, M₄), les traces de coût, l'effet du
pas, le seuil optimal, les décomptes par quadrant, les scores individuels et les
sommes de probabilités un-contre-tous.

Toute valeur du PDF doit se retrouver dans sa sortie. Un écart signale soit une
régression dans le code, soit une valeur périmée dans le texte.

## États du modèle

Les coefficients dépendent du point d'arrêt. Le document les nomme, et chaque
figure ou tableau indique lequel il emploie.

| nom | coefficients | obtenu par |
|---|---|---|
| M₀ | `(0 ; 0 ; 0)` | point de départ |
| M₄₀₀ | `(−4,745 ; −3,454 ; +3,469)` | 400 tours à α = 1, figures de la partie I |
| M_arr | `(−5,176 ; −3,746 ; +3,787)` | critère de stagnation, 983 tours, partie II |
| M₄ | quatre jeux de trois nombres | quatre descentes un-contre-tous |

## Cahier pratique

Douze fichiers dans `scripts/tuto/`, exécutables l'un après l'autre :

| fichier | fonction ajoutée |
|---|---|
| `step0_prepare.py` | `load`, `fit_stats`, `design` |
| `step1_score.py` | `score_of` |
| `step2_sigmoid.py` | `sigmoid` |
| `step3_single_cost.py` | `softplus`, `student_cost` |
| `step4_total_cost.py` | `total_cost` |
| `step5_gradient.py` | `gradient`, `measured_slope` |
| `step6_one_step.py` | `one_step` |
| `step7_loop.py` | `descend` |
| `step8_four_houses.py` | `train`, `predict` |
| `step9_holdout.py` | `split` |
| `step10_evaluation.py` | matrice de confusion, Wilson, plancher |
| `transfert_micro.py` | la même chaîne sur douze pièces usinées |

L'ordre suit celui du document : la préparation vient en premier, et chaque étape
n'emploie que ce que les précédentes ont produit. Le code n'apparaît pas dans le
cahier ; il est à l'annexe des corrigés, avec la réponse à chaque question de
transfert.

## Protocole d'évaluation

Le résultat annoncé est mesuré ainsi : découpage stratifié 80/20 sur les indices,
graine 0, **statistiques de préparation ajustées sur les seules lignes
d'apprentissage**, test consulté une fois.

```
311/320 = 0,9719    Wilson 95 % [0,9474 ; 0,9851]
plancher (classe majoritaire) : 0,3312
```

Limite connue et documentée au chapitre 12 : les deux matières employées en
partie I ont été choisies après examen du fichier étiqueté entier. Cette
sélection précède le découpage et n'est donc pas couverte par le protocole.

## Figures

Les PNG de `figures/` et les traces de `data/` sont produits par
`scripts/gen_*.py`, qui demandent NumPy et Matplotlib (`make install`).
`make -C docs doc` ne les régénère pas ; `make -C docs figures` le fait, et doit
laisser `data/` inchangé — un `git diff` non vide sur ce répertoire signale une
régression.

`surface3d.png` et `contours.png` représentent la surface de perte à biais figé
(`w0 = -4,745`), parcourue par une descente de gradient à **deux** coefficients
réellement exécutée sur cette surface — et non par la projection de la descente à
trois coefficients. C'est ce qui rend exacte la lecture « la trajectoire coupe
les lignes de niveau perpendiculairement ». Cette descente contrainte aboutit à
`(-3,489 ; +3,512)`, légèrement différent de M₄₀₀, ce que le document signale.

## Licence

Texte sous CC-BY-SA 4.0. Le jeu de données provient du sujet DSLR de 42 ; il est
synthétique et les personnages qu'il nomme sont fictifs.
