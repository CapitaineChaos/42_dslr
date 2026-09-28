# Atelier interactif

    make demo            # http://localhost:8000
    make demo PORT=9000  # autre port
    make contraste       # contrôle WCAG de la palette

Depuis la racine du dépôt. Aucune compilation : un serveur statique suffit.
`src/data.js` se régénère dès que le scénario ou l'exportateur changent.

## Écran

| zone | contenu |
|---|---|
| barre haute | notes brutes, effectifs, α |
| parcours | schéma des dix nœuds : préparation, boucle de correction, décision, évaluation |
| itération | compteur, sauts, lecture continue, curseur ; perte J, erreurs, exactitude |
| cours | position, titre, formule, texte chiffré, calcul déroulé, tableau des élèves, atelier, détail mathématique replié |
| figures | la figure de l'étape en tête, les six autres en vignettes |

Le schéma place la boucle dans un cadre : score, probabilité, perte, gradient,
correction, et une flèche de retour qui porte le compteur d'itérations. On n'en
sort que par la flèche d'arrêt. Une pastille par étape sous chaque nœud ; un clic
sur un nœud ou une pastille y mène. Le nœud courant s'allume et la flèche qui y
mène s'anime : l'entrée de la boucle à l'itération 0, le retour ensuite, l'arrêt
à la sortie.

Au bout de la boucle, `suivant` devient `itération t+1` et repart au score.
`aller à l'arrêt` saute à la dernière itération, sur l'étape du critère, comme le
code qui ne sort de la boucle qu'au critère ; `suivant` mène alors à la décision.

Le tableau des élèves change de colonnes à chaque étape : notes, `x`, `z`, `p`,
`ℓ`, `p − y`, contributions au gradient, réponse, cas. Sa ligne de pied donne
`J`, la somme des contributions et le gradient, la correction des trois poids ou
le décompte VP, FN, FP, VN. Le calcul déroulé réécrit l'opération de l'étape
avec les nombres de l'élève sélectionné ; un clic sur un nom en change.

Un clic, Entrée ou Espace sur une carte de figure l'ouvre en superposition ;
`fermer`, un clic sur le voile ou Échap la referment.

`lecture` parcourt la descente du premier au dernier pas en douze secondes. Un
saut manuel ou le curseur l'interrompent.

Au clavier : les flèches gauche et droite parcourent le cours, la barre d'espace
lance et arrête la lecture, Échap referme un agrandissement.

## Lisibilité

Thème sombre, un seul accent cyan réservé au parcours : étape courante, boucle
active, commandes d'itération. Maisons dans le rouge et le vert des graphiques
Python, éclaircis pour le fond sombre ; erreurs de classement en ambre. Le texte
de l'interface tient le seuil AAA de 7:1 sur son fond, les couleurs de données
4,5:1, les traits de figure 3:1. `verifie_contraste.py` échoue si une paire
descend sous son seuil.

Corps de base à 16 px, plancher à 13 px, longueur de ligne bornée à 62
caractères.

La grille parcours, cours et figures ne s'applique qu'au-delà de 78 rem de large
et 40 rem de haut ; en dessous, la page est un document qui défile, et à 200 % de
zoom la mise en page repasse d'elle-même en colonne unique. Le calcul passe à
droite du texte quand la colonne de cours dépasse 60 rem. Le schéma garde une
largeur minimale et défile seul sur un écran étroit.

Chaque distinction porte une marque de forme en plus de sa teinte : les maisons
se lisent au carré et au disque sur les figures, à la valeur de `y` dans le
tableau ; une observation mal classée porte un filet ambre à gauche de sa ligne
et la case `FP` ou `FN`. Les animations du schéma s'arrêtent sous
`prefers-reduced-motion`.

Chaque tracé est un `role="img"` dont le nom accessible est réécrit à chaque
rendu. Le changement d'étape et le changement d'itération sont annoncés dans une
région `aria-live`, avec un retard de 400 ms pour qu'un glissement du curseur ne
produise qu'une annonce. Les deux scènes en relief n'ont pas d'équivalent au
clavier : leur orientation de départ est celle qui se lit le mieux.

Le plan des notes est tracé à échelles égales sur les deux axes et la ROC dans
un carré : les bornes de l'axe le moins étiré sont élargies pour que l'angle de
la frontière reste juste. Le cadre de tracé garde le rapport 4:3. Les valeurs
qu'une figure fixe sans les montrer — la section `w₀` de la trajectoire, la
hauteur où son relief est coupé, l'aire sous la ROC — sont écrites dans l'en-tête
de leur carte.

Les nombres qui changent à chaque itération sont calés à largeur fixe, compteur,
mesures et tableau compris : sans cela les commandes se déplaceraient sous le
curseur à chaque cran.

## Deux démonstrations

**Sans centrage ni réduction.** La case *notes brutes* entraîne sur les notes
telles quelles, à α, code et critère d'arrêt identiques. La descente atteint la
limite de 6000 itérations.

| | standardisé | notes brutes |
|---|---|---|
| itérations | 528, critère atteint | 5999, limite |
| `J` | 0,3506 | 60,82 |
| erreurs | 1 / 19 | 4 / 19 |
| ‖w‖ | 6,71 | 258 |

L'écart des écarts types, σ(Vol)/σ(Potions) = 5,2, suffit à rendre la hessienne
mal conditionnée : un pas adapté à une direction est trop grand pour l'autre.

**Le débordement.** L'étape Stabilité numérique porte un atelier : un
curseur sur `z`, et les mêmes calculs en version naïve et en version du code.

| z | `σ` naïve | `σ` du code | `ln(1+e^z)` naïf | du code |
|---|---|---|---|---|
| -710 | 0 | 4,48e-309 | 0 | 0 |
| +710 | 1 | 1 | **+∞** | 710 |

Au-delà de `\|z\| ≈ 709,8`, `exp` dépasse la borne du flottant double. En
JavaScript la perte cesse d'être un nombre ; en Python, `np.exp(750)` renvoie
`inf` avec un avertissement.

## Le jeu de données

19 élèves d'apprentissage, 3 d'évaluation, deux matières, α = 1.
`construire_scenario.py` balaie une liste de réglages et retient le premier qui
tient toutes les bornes : norme finale entre 2,5 et 9, dernier basculement entre
la vingtième et la trois-centième itération, au moins deux basculements après le
dixième, quatre paliers d'exactitude, plafond de 700 itérations. Il affiche les
réglages rejetés et la raison du rejet.

| itération | 0 | 5 | 10 | 528 |
|---|---|---|---|---|
| exactitude | 47,4 % | 73,7 % | 89,5 % | 94,7 % |
| erreurs | 10 | 5 | 2 | 1 |

Le levier est le conditionnement : les deux notes covarient, et cette direction
de plus grande variance est sans rapport avec l'étiquette, qui dépend d'un écart
perpendiculaire plus étroit. La descente parcourt d'abord la direction de plus
forte pente, puis pivote sur des dizaines d'itérations ; les élèves proches de
la frontière basculent pendant ce pivot.

Deux étiquettes contredites empêchent la séparation linéaire parfaite et bornent
la norme des coefficients.

## Cohérence avec le code Python

`src/model.js` est un portage de la descente de `dslr/model.py` : sigmoïde à deux branches,
softplus, critère d'arrêt sur la variation relative de la perte mesurée avant la
mise à jour des coefficients.

Le portage a été contrôlé sur le jeu des slides, α = 1, dont chaque valeur se
recalcule à la main et est vérifiée par `docs/slides/scripts/construire_cas.py` :

| grandeur | JavaScript | `construire_cas.py` |
|---|---|---|
| `J` à w = 0 | 0,693147 | ln 2 |
| w à l'itération 1 | 0,100 -0,275 +0,2575 | identique |
| w à l'arrêt | 0,6037 -1,0294 +0,5141 | 0,603740 -1,029417 +0,514094 |
| erreurs | 4 / 20 | 4 |
| exactitude, précision, rappel | 80,0 / 83,3 / 83,3 % | identiques |

## Contrôles

    python3 docs/demo/scripts/verifie_contraste.py   # 28 paires
    python3 docs/demo/scripts/verifie_figures.py     # les sept figures dans un navigateur
    python3 docs/demo/scripts/construire_scenario.py # régénère et vérifie le scénario
    python3 docs/demo/scripts/exporter_donnees.py    # régénère src/data.js

## Fichiers

    index.html                 la page et les identifiants que les vues cherchent

    css/tokens.css             palette et échelle typographique
    css/base.css               éléments, boutons, champs, anneau de focus
    css/shell.css              grille de page et barre haute
    css/flow.css               schéma du parcours et commandes d'itération
    css/lesson.css             colonne de cours, détail replié, ateliers
    css/calc.css               calcul déroulé et tableau des élèves
    css/figures.css            colonne des figures et agrandissement

    src/app.js                 amorçage, annonces, clavier
    src/state.js               état courant et deux canaux d'abonnement
    src/navigation.js          déplacements dans le cours et dans la descente
    src/dataset.js             matrices, trace de la descente, cadrage des figures
    src/context.js             les nombres que les textes peuvent citer
    src/model.js               portage de la descente de dslr/model.py
    src/data.js                généré par scripts/exporter_donnees.py

    src/content/steps.js       les dix nœuds et les 18 étapes : texte, détail, tableau
    src/content/labs.js        les ateliers attachés à une étape

    src/figures/canevas.js     palette, repère, grille, marqueurs
    src/figures/scene.js       socle des deux figures en relief, sur Plotly
    src/figures/frontiere.js   le plan des deux notes et la droite z = 0
    src/figures/scores.js      les scores z sur une droite graduée
    src/figures/sigmoide.js    la fonction logistique et les scores des élèves
    src/figures/surface.js     la surface de probabilité
    src/figures/perte.js       J en fonction de l'itération
    src/figures/chemin.js      la trajectoire des coefficients sur le relief de J
    src/figures/roc.js         la courbe ROC et son aire
    src/figures/index.js       registre et ordre des cartes

    src/views/flow.js          schéma du parcours
    src/views/lesson.js        cours, séparé en rendu d'étape et rendu de valeurs
    src/views/calc.js          calcul déroulé et tableau des élèves
    src/views/figures.js       colonne des figures et agrandissement
    src/views/transport.js     itération, sauts, lecture, mesures
    src/views/nav.js           précédent, aller à l'arrêt, suivant
    src/views/settings.js      centrage et réduction, effectifs
    src/views/live.js          région d'annonce

    vendor/tex-svg.js          MathJax, rendu des formules
    vendor/plotly-gl3d.min.js  Plotly 3.7.0, bundle gl3d, pour les deux reliefs

Les deux bibliothèques sont dans le dépôt : la page ne demande rien au réseau et
s'ouvre depuis un disque. `plotly-gl3d` est le bundle partiel — surfaces et
nuages en trois dimensions, sans les tracés plats dont les cinq autres figures
n'ont pas besoin.

Une figure déclare `dom: true` quand son tracé s'écrit dans un élément plutôt
que sur un canevas : `views/figures.js` lui passe alors le conteneur, sa taille
et l'état d'agrandissement, au lieu d'un contexte 2D.

Une vue ne connaît que son coin de page et les deux canaux auxquels elle
s'abonne : `step` pour ce qui change d'étape en étape, `iteration` pour ce qui
suit la descente. C'est cette séparation qui évite de retypographier la formule à
chaque cran du curseur d'itération.
