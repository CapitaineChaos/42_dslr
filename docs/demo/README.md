# Atelier interactif

    make demo            # http://localhost:8000
    make demo PORT=9000  # autre port
    make contraste       # contrôle WCAG de la palette

Depuis la racine du dépôt. Aucune compilation : un serveur statique suffit.
`src/data.js` se régénère dès que le scénario ou l'exportateur changent.

## Écran

| zone | contenu |
|---|---|
| barre haute | centrage et réduction, effectifs, α |
| sommaire | les huit sections, les étapes de la section courante, la boucle encadrée |
| cours | titre, formule, prose chiffrée à l'itération courante, atelier |
| figures | les sept figures en grille, au rapport 4:3 |
| élèves | les 22 lignes des deux groupes : `y`, `z`, `p`, case de la matrice de confusion |
| bas | itération, sauts, lecture continue, curseur, mesures |

Score, probabilité, perte, gradient et mise à jour forment une boucle : arrivé
au bout, `suivant` repart au score en incrémentant l'itération. Un passage
complet vaut exactement une itération. On en sort par `sortir de la boucle`,
vers décision puis évaluation.

La figure que l'étape courante commente porte un en-tête plein. Un clic, Entrée
ou Espace sur une carte l'agrandit sur la zone des figures et de la liste ;
`fermer` ou Échap reviennent aux sept.

`lecture` parcourt la descente du premier au dernier pas en douze secondes. Un
saut manuel ou le curseur l'interrompent.

Au clavier : les flèches gauche et droite parcourent le cours, la barre d'espace
lance et arrête la lecture, Échap referme un agrandissement.

## Lisibilité

Palette unique, claire, en gris neutres : le texte de l'interface tient le seuil
AAA de 7:1 sur son fond, les trois couleurs de données 4,5:1, les traits de
figure 3:1. `verifie_contraste.py` échoue si une paire descend sous son seuil.

Corps de base à 16 px, plancher à 13 px, longueur de ligne bornée à 62
caractères.

La page est un document qui défile ; les quatre colonnes ne s'appliquent
qu'au-delà de 78 rem de large et 40 rem de haut. À 200 % de zoom, la mise en
page repasse d'elle-même en colonne unique.

Chaque distinction porte une marque de forme en plus de sa teinte : les maisons
se lisent au carré et au disque sur les figures, à la valeur de `y` dans la
liste ; une observation mal classée porte la case `FP` ou `FN`, la graisse et un
filet à gauche de sa ligne.

Chaque tracé est un `role="img"` dont le nom accessible est réécrit à chaque
rendu. Le changement d'étape et le changement d'itération sont annoncés dans une
région `aria-live`, avec un retard de 400 ms pour qu'un glissement du curseur ne
produise qu'une annonce. Les deux scènes en relief n'ont pas d'équivalent au
clavier : leur orientation de départ est celle qui se lit le mieux.

Le plan des notes est tracé à échelles égales sur les deux axes et la ROC dans
un carré : les bornes de l'axe le moins étiré sont élargies pour que l'angle de
la frontière reste juste. Le cadre de tracé garde le rapport 4:3 quelle que soit
la hauteur de la colonne. Les valeurs qu'une figure fixe sans les montrer — la
section `w₀` de la trajectoire, la hauteur où son relief est coupé, l'aire sous
la ROC — sont écrites dans l'en-tête de leur carte.

Les nombres qui changent à chaque itération sont calés à largeur fixe, compteur,
mesures et liste comprises : sans cela la barre du bas se déplace sous le curseur
à chaque cran.

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
JavaScript la perte cesse d'être un nombre ; en Python, `pow(E, -x)` lève
`OverflowError`.

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

`src/model.js` est un portage de `logreg_train.py` : sigmoïde à deux branches,
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

    python3 docs/demo/scripts/verifie_contraste.py   # 19 paires
    python3 docs/demo/scripts/verifie_figures.py     # les sept figures dans un navigateur
    python3 docs/demo/scripts/construire_scenario.py # régénère et vérifie le scénario
    python3 docs/demo/scripts/exporter_donnees.py    # régénère src/data.js

## Fichiers

    index.html                 la page et les identifiants que les vues cherchent

    css/tokens.css             palette et échelle typographique
    css/base.css               éléments, boutons, champs, anneau de focus
    css/shell.css              grille de page, barre haute, barre d'itération
    css/contents.css           sommaire
    css/lesson.css             colonne de cours et ateliers
    css/figures.css            grille des figures et agrandissement
    css/roster.css             liste des élèves

    src/app.js                 amorçage, annonces, clavier
    src/state.js               état courant et deux canaux d'abonnement
    src/navigation.js          déplacements dans le cours et dans la descente
    src/dataset.js             matrices, trace de la descente, cadrage des figures
    src/context.js             les nombres que la prose peut citer
    src/model.js               portage de logreg_train.py
    src/data.js                généré par scripts/exporter_donnees.py

    src/content/steps.js       les 18 étapes, contenu du cours
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

    src/views/contents.js      sommaire
    src/views/lesson.js        cours, séparé en rendu d'étape et rendu de valeurs
    src/views/figures.js       grille des quatre figures et agrandissement
    src/views/roster.js        liste des élèves
    src/views/transport.js     itération, sauts, lecture, métriques
    src/views/nav.js           précédent, suivant, sortir de la boucle
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
