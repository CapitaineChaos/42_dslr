# Atelier interactif

    make demo            # http://localhost:8000
    make demo PORT=9000  # autre port
    make contraste       # contrôle WCAG de la palette

Depuis la racine du dépôt. Aucune compilation : un serveur statique suffit.
`src/data.js` se régénère dès que le scénario ou l'exportateur changent.

## Écran

| zone | contenu |
|---|---|
| parcours | schéma des treize nœuds : présentation, données, médiane, standardisation, maison, les cinq nœuds de la boucle de correction, décision, puis validation et prédiction sur deux branches |
| console | toutes les commandes, sous le schéma : passage (pli 1 à 5, modèle final) et maison (G, P, S), étape (précédent, compteur, suivant), paramètres (α, ε, limite, n), mesures du modèle affiché (J, erreurs, exactitude), puis itération (compteur, itération d'arrêt et sa cause), sauts, lecture, frise, aller à l'arrêt |
| cours | lecture seule : position, titre, formule, fiche de l'étape, calcul déroulé, tableau des élèves, atelier, détail mathématique |
| figures | une figure de tête et six miniatures ; la miniature que l'étape commente porte un liseré cyan |

Le schéma ne porte ni cadre, ni nom de boucle, ni nombre : trois flèches de
retour dessinent les trois boucles, que la présentation nomme. Sous la ligne, la
boucle de correction revient de la mise à jour au score ; on n'en sort que par
la flèche d'arrêt. Plus bas, la boucle des maisons revient de l'arrêt au nœud
Maison : un modèle par maison, un contre tous. Au-dessus, la boucle des plis
revient de la validation à la médiane. Après la décision, le schéma se sépare : les cinq plis vont à la
validation, le modèle final à la prédiction. Une pastille par étape sous chaque
nœud ; un clic sur un nœud ou une pastille y mène. Le nœud courant s'allume et
la flèche qui y mène s'anime ; la flèche de retour de la boucle en cours reste
teintée.

Au bout de la boucle, `Suivant` repart au score à l'itération suivante ; la
flèche de retour du schéma s'anime. `Aller à l'arrêt`, grisé hors de la boucle,
saute à la dernière itération, sur l'étape du critère, comme le code qui ne sort
de la boucle qu'au critère ou à la limite ; `Suivant` mène alors à la décision.
La console affiche l'itération d'arrêt du passage et sa cause : `critère` quand
`‖∇J‖` passe sous `ε` = 10⁻³, `limite` quand les 6000 mises à jour sont
épuisées. La page exécute toutes les descentes au chargement et les rejoue :
c'est ce qui donne l'itération d'arrêt, et la longueur de la frise, avant de
l'atteindre.

Rien ne bouge quand l'itération change. Les libellés des commandes sont
constants et chaque nombre a une largeur fixe. Le texte et le tableau réservent,
au changement d'étape, la plus grande hauteur qu'ils prendront au fil de la
descente (`views/steady.js`). La formule a un cadre de hauteur fixe et reste
masquée tant que MathJax ne l'a pas écrite. Au changement d'étape, le cours
remonte en haut ; la figure de tête ne change pas.

La fiche de chaque étape suit la même grille : ce qu'on calcule, avec quoi,
pourquoi, et la valeur à l'itération courante. Chaque symbole (`x₁`, `z`, `p`,
`ℓ`, `J`, `∇J`, `α`, `μ`, `σ`…) est souligné en pointillé et affiche sa
définition au survol ou au focus clavier, dans le texte comme dans les en-têtes
du tableau (`content/symbols.js`).

Le tableau des élèves change de colonnes à chaque étape : notes, `x`, `z`, `p`,
`ℓ`, `p − y`, contributions au gradient, réponse, cas. Sa ligne de pied donne
`J`, la somme des contributions et le gradient, la correction des trois poids ou
le bilan des plis. La matrice de confusion et les scores par maison s'affichent
au-dessus du tableau. Le calcul déroulé réécrit l'opération de l'étape
avec les nombres de l'élève sélectionné ; un clic sur un nom en change.

Un clic, Entrée ou Espace sur une miniature la met en tête et ramène la colonne
en haut ; sur la figure de tête, il l'ouvre en superposition. `Fermer`, un clic
sur le voile ou Échap la referment.

Deux notes sont absentes du scénario : le tableau les montre en tiret à l'étape
Données, puis la valeur imputée, signalée, aux étapes suivantes.

L'entraînement est exécuté six fois : une fois par pli, ce pli mis de côté,
puis sur les 19 élèves d'apprentissage pour le modèle final. Chaque passage
refait médiane, μ, σ et descente sur ses seuls élèves d'entraînement
(`src/dataset.js`). Comme dans `cross_validation.py`, un tour de la boucle des
plis enchaîne préparation, descente et évaluation du pli : après la décision,
`Suivant` mène à l'évaluation, puis repart à la médiane avec le pli suivant.
Après le cinquième pli viennent le bilan et la matrice de confusion hors pli,
puis le modèle final, qui passe de la décision à la prédiction. Les plis sont
stratifiés comme dans le projet, maison par maison en repartant du premier pli,
dans l'ordre du fichier au lieu d'un tirage aléatoire.

Trois maisons, comme le projet en a quatre : chaque passage entraîne trois
modèles un contre tous, chacun par sa propre descente, puis attribue la maison
du plus grand score. Les étapes de la boucle montrent le modèle de la maison en
cours ; la décision et la suite montrent les trois modèles à l'arrêt, et la
figure Frontière passe alors aux trois régions du plus grand score. Matrices de
confusion 3 × 3 ; précision, rappel et F1 par maison, sur les élèves
d'entraînement à l'étape Décision, hors pli à l'étape Validation.

La frise met les dix-huit descentes bout à bout : six passages, chacun coupé en
trois segments de maison de même largeur, de l'itération 0 à l'arrêt. Le curseur, les sauts `±1` et `±10` et les
flèches du clavier la parcourent d'un seul tenant : au-delà de l'arrêt d'un
passage, on continue au début du suivant. Les commandes restent actives
partout : hors de l'entraînement, toucher à la frise, aux sauts ou à la lecture
ramène au score, au point choisi, et choisir un passage mène à sa médiane. Dans
l'entraînement, le sélecteur mène au début du passage, ou à son arrêt après la
boucle ; sur l'évaluation d'un pli, il choisit le pli évalué. Un glissement
n'applique que la dernière position de chaque image.

`Lecture` parcourt chaque descente en quatre secondes, quelle que soit sa
longueur, marque une courte pause à son arrêt, puis continue au début de la
suivante, jusqu'à l'arrêt du dernier modèle final. Un saut manuel ou le curseur
l'interrompent.

Au clavier : les flèches gauche et droite parcourent le cours, la barre d'espace
lance et arrête la lecture, Échap referme un agrandissement.

## Lisibilité

Thème sombre, un seul accent cyan réservé au parcours : étape courante, boucle
active, commandes d'itération. Maisons dans le rouge, le jaune et le vert des
graphiques Python, éclaircis pour le fond sombre ; erreurs de classement en
violet. Le texte
de l'interface tient le seuil AAA de 7:1 sur son fond, les couleurs de données
4,5:1, les traits de figure 3:1. `verifie_contraste.py` échoue si une paire
descend sous son seuil.

Corps de base à 16 px, plancher à 13 px, longueur de ligne bornée à 62
caractères.

La grille parcours, cours et figures ne s'applique qu'au-delà de 78 rem de large
et 40 rem de haut ; la console tient sur deux lignes au-delà de 94 rem, sur
trois en dessous ; en dessous, la page est un document qui défile, et à 200 % de
zoom la mise en page repasse d'elle-même en colonne unique. Le calcul passe à
droite du texte quand la colonne de cours dépasse 60 rem. Le schéma garde une
largeur minimale et défile seul sur un écran étroit.

Chaque distinction porte une marque de forme en plus de sa teinte : les maisons
se lisent au carré et au disque sur les figures, à la valeur de `y` dans le
tableau ; une observation mal classée porte un filet violet à gauche de sa
ligne et une croix. Les animations du schéma s'arrêtent sous
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

## Le débordement

L'étape Stabilité numérique porte un atelier : un curseur sur `z`, et les mêmes
calculs en version naïve et en version du code.

| z | `σ` naïve | `σ` du code | `ln(1+e^z)` naïf | du code |
|---|---|---|---|---|
| -710 | 0 | 4,48e-309 | 0 | 0 |
| +710 | 1 | 1 | **+∞** | 710 |

Au-delà de `\|z\| ≈ 709,8`, `exp` dépasse la borne du flottant double. En
JavaScript la perte cesse d'être un nombre ; en Python, `np.exp(750)` renvoie
`inf` avec un avertissement.

## Le jeu de données

25 élèves d'apprentissage (10 Gryffondor, 6 Poufsouffle, 9 Serpentard), 5
réservés à la prédiction, deux matières, α = 1. Deux notes sont effacées après
la sélection (`MISSING`), près de la médiane de leur matière, pour que
l'imputation ait quelque chose à combler.

`construire_scenario.py` place d'abord Gryffondor et Serpentard : il balaie une
liste de réglages et retient le premier qui tient toutes les bornes (norme
finale entre 2,5 et 9, dernier basculement entre la vingtième et la
trois-centième itération, au moins deux basculements après le dixième, quatre
paliers d'exactitude, plafond de 700 itérations). Le levier est le
conditionnement : les deux notes covarient, et cette direction de plus grande
variance est sans rapport avec l'étiquette, qui dépend d'un écart
perpendiculaire plus étroit.

Poufsouffle est ajoutée au bout de l'axe commun, bonne dans les deux matières,
en recouvrant le haut de la bande des deux autres maisons. Plus loin, son
modèle devenait séparable et butait sur la limite ; plus près, la décision
tombait sous 75 %. Le script affiche les trois modèles un contre tous.

| passage | arrêts G, P, S | pli évalué | entraînement |
|---|---|---|---|
| pli 1 | 1617, 1880, 2949 | 3 / 6 | 16 / 19 |
| pli 2 | 458, 961, 266 | 5 / 5 | 14 / 20 |
| pli 3 | 416, 720, 308 | 5 / 5 | 16 / 20 |
| pli 4 | 502, 1696, 372 | 4 / 5 | 17 / 20 |
| pli 5 | 588, 1620, 350 | 3 / 4 | 17 / 21 |
| final | 554, 1089, 399 | — | 20 / 25 |

Validation croisée : 20 élèves sur 25 bien classés hors pli, soit 80 %. F1 de
85,7 % pour Gryffondor, 66,7 % pour Poufsouffle, 82,4 % pour Serpentard. Le
modèle final classe 3 des 5 élèves réservés.

Une descente arrêtée par la limite est relancée sans elle au chargement : le
cours donne l'itération où le critère l'aurait arrêtée. Quand les élèves d'une
maison sont séparables par une droite, J n'a pas de minimum et `‖∇J‖` ne
décroît qu'à peu près comme 1/t.

## Cohérence avec le code Python

`src/model.js` est un portage de la descente de `dslr/model.py` : sigmoïde à deux branches,
softplus, critère d'arrêt sur la norme du gradient mesurée avant la mise à jour
des coefficients.

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
    python3 docs/demo/scripts/construire_scenario.py # régénère et vérifie le scénario (calculs dans scenario_calcul.py)
    python3 docs/demo/scripts/exporter_donnees.py    # régénère src/data.js

## Démarrage

Une barre de chargement occupe l'écran pendant que `src/boot.js` attend
MathJax, calcule les six passages (une préparation et trois descentes chacun),
puis la validation croisée, monte les vues et attend l'écriture de la première
formule. Chaque étape rend la main au navigateur avec une durée minimale, pour
que la barre se lise : le calcul réel ne prend que quelques dizaines de
millisecondes. La page, masquée mais déjà mise en place, apparaît ensuite.

## Fichiers

Aucun fichier ne dépasse 200 lignes.

    index.html                   la page et les identifiants que les vues cherchent

    css/tokens.css               palette et échelle typographique
    css/base.css                 éléments, boutons, champs, anneau de focus
    css/shell.css                grille de page
    css/loader.css               écran de chargement
    css/flow.css                 schéma du parcours
    css/console.css              console : groupes, boutons, mesures, mises en page
    css/frise.css                frise des descentes et curseur
    css/lesson.css               colonne de cours, fiche, détail
    css/lab.css                  ateliers
    css/calc.css                 calcul déroulé, tableau des élèves, matrice de confusion
    css/figures.css              colonne des figures et agrandissement

    src/boot.js                  démarrage : chargement, calcul, montage
    src/app.js                   montage des vues, annonces, clavier
    src/state.js                 état courant et trois canaux d'abonnement
    src/navigation.js            déplacements dans le cours, les boucles et la frise
    src/dataset.js               les six passages, liaisons vivantes, bilan hors pli
    src/training.js              préparation des notes et entraînement d'un modèle
    src/context.js               les nombres que les textes peuvent citer
    src/model.js                 portage de dslr/model.py, matrice et scores
    src/data.js                  généré par scripts/exporter_donnees.py

    src/content/steps.js         ordre des étapes
    src/content/steps/*.js       une étape par fichier : fiche, détail, tableau
    src/content/steps/nodes.js   les treize nœuds du schéma
    src/content/steps/format.js  mise en forme commune aux fiches
    src/content/symbols.js       définition de chaque symbole, affichée au survol
    src/content/labs.js          les ateliers attachés à une étape

    src/figures/canevas.js       palette, repère, grille, marqueurs
    src/figures/scene.js         socle des deux figures en relief, sur Plotly
    src/figures/frontiere.js     le plan des deux notes : modèle en cours, puis régions
    src/figures/scores.js        les scores z sur une droite graduée
    src/figures/sigmoide.js      la fonction logistique et les scores des élèves
    src/figures/surface.js       la surface de probabilité
    src/figures/perte.js         J en fonction de l'itération
    src/figures/chemin.js        la trajectoire des coefficients sur le relief de J
    src/figures/roc.js           la courbe ROC et son aire
    src/figures/index.js         registre et ordre des cartes

    src/views/loader.js          barre de chargement
    src/views/flow.js            état du schéma
    src/views/flow/draw.js       tracé du schéma
    src/views/lesson.js          cours, séparé en rendu d'étape et rendu de valeurs
    src/views/calc.js            tableau des élèves : assemblage
    src/views/calc/*.js          mesure d'un élève, colonnes, pied, matrice, calcul déroulé
    src/views/figures.js         colonne des figures et agrandissement
    src/views/transport.js       console : assemblage
    src/views/console/*.js       mesures, sélecteurs, lecture et sauts, frise
    src/views/nav.js             console : précédent, suivant, aller à l'arrêt
    src/views/steady.js          hauteur réservée des blocs qui suivent l'itération
    src/views/live.js            région d'annonce

    vendor/tex-svg.js          MathJax, rendu des formules
    vendor/plotly-gl3d.min.js  Plotly 3.7.0, bundle gl3d, pour les deux reliefs

Les deux bibliothèques sont dans le dépôt : la page ne demande rien au réseau et
s'ouvre depuis un disque. `plotly-gl3d` est le bundle partiel — surfaces et
nuages en trois dimensions, sans les tracés plats dont les cinq autres figures
n'ont pas besoin.

Une figure déclare `dom: true` quand son tracé s'écrit dans un élément plutôt
que sur un canevas : `views/figures.js` lui passe alors le conteneur, sa taille
et l'état d'agrandissement, au lieu d'un contexte 2D.

Une vue ne connaît que son coin de page et les canaux auxquels elle
s'abonne : `step` pour ce qui change d'étape en étape, `model` pour un
changement de passage ou de maison, `iteration` pour ce qui suit la descente. C'est cette séparation qui évite de retypographier la formule à
chaque cran du curseur d'itération.
