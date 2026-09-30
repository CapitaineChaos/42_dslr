# Atelier interactif

    make demo            # http://localhost:8000
    make demo PORT=9000  # autre port
    make contraste       # contrôle WCAG de la palette

Ces commandes se lancent depuis la racine du dépôt. La page ne demande aucune
compilation et un serveur statique suffit. `scripts/serveur.py` interdit au
navigateur de garder les modules en cache sans les revalider. Avec
`python -m http.server`, une page rechargée peut mêler l'ancien code au nouveau
HTML. `make demo` régénère `src/data.js` quand le scénario ou l'exportateur ont
changé.

## Écran

Un écran de démarrage précède le simulateur. Il affiche le logo, la jauge du
calcul, puis la configuration et le bouton `Démarrer`, actif une fois le calcul
terminé. La seule option actuelle est la validation croisée, désactivée par
défaut. Les options sont déclarées dans `src/config.js` et l'écran les affiche
toutes. Le cours n'est chargé qu'à `Démarrer`, avec les options choisies.
Pendant le calcul, rien ne change de taille : la carte a une largeur fixe, le
libellé d'étape tient sur une ligne et se tronque, le pourcentage est en chasse
fixe.

| zone | contenu |
|---|---|
| parcours | schéma de douze nœuds : présentation, données, médiane, standardisation, maison, les cinq nœuds de la boucle de correction, décision, prédiction ; avec la validation croisée, treize, la validation et la prédiction sur deux branches après la décision |
| console | toutes les commandes, sous le schéma : passage (pli 1 à 5, modèle final) et maison (G, P, S), étape (précédent, compteur, suivant), paramètres (α, ε, limite, n), mesures du modèle affiché (J, erreurs, exactitude), puis itération (compteur, itération d'arrêt et sa cause), sauts, lecture, frise, aller à l'arrêt |
| cours | lecture seule : position, titre, formule, fiche de l'étape, calcul déroulé, tableau des élèves, atelier, détail |
| figures | une figure de tête et six miniatures ; la miniature que l'étape commente porte le liseré de l'accent |

Le schéma ne porte aucun cadre, aucun nom de boucle et aucun nombre. Les
boucles sont dessinées par des flèches de retour, et la présentation les nomme.
La boucle de correction, sous la ligne, revient de la mise à jour au score, et
sa seule sortie est la flèche d'arrêt. La boucle des maisons, plus bas, revient
de l'arrêt au nœud Maison, avec un modèle par maison, un contre tous. Avec la
validation croisée, la boucle des plis revient de la validation à la médiane,
au-dessus de la ligne. Le schéma se sépare alors après la décision : les cinq
plis vont à la validation, le modèle final à la prédiction. Chaque nœud porte
une pastille par étape, et un clic sur un nœud ou une pastille y mène. Le nœud
courant s'allume et la flèche qui y mène s'anime. La flèche de retour de la
boucle en cours reste teintée.

Au bout de la boucle, `Suivant` repart au score à l'itération suivante, et la
flèche de retour du schéma s'anime. `Aller à l'arrêt`, grisé hors de la boucle,
saute à la dernière itération, sur l'étape du critère. Le code ne sort lui
aussi de la boucle qu'au critère ou à la limite. `Suivant` mène alors à la
décision. La console affiche l'itération d'arrêt du passage et sa cause :
`critère` quand `‖∇J‖` passe sous `ε` = 10⁻³, `limite` quand les 6000 mises à
jour sont épuisées. La page exécute toutes les descentes au chargement, puis
les rejoue. L'itération d'arrêt et la longueur de la frise sont donc connues
avant que la lecture n'atteigne l'arrêt.

Rien ne bouge quand l'itération change. Les libellés des commandes sont
constants et chaque nombre a une largeur fixe, y compris le compteur, les
mesures et le tableau. Sans cela, les commandes se déplaceraient sous le
curseur à chaque cran. Au changement d'étape, le texte et le tableau réservent
la plus grande hauteur qu'ils prendront au fil de la descente
(`views/steady.js`). La formule a un cadre de hauteur fixe et reste masquée
tant que MathJax ne l'a pas écrite. Au changement d'étape, le cours remonte en
haut et la figure de tête ne change pas.

La fiche de chaque étape est une liste terme-définition, et la ligne teintée de
l'accent porte la valeur à l'itération courante. Le détail est masqué quand
l'étape n'en a pas, et ne porte un titre que si l'étape en donne un. Chaque
symbole (`x₁`, `z`, `p`, `ℓ`, `J`, `∇J`, `α`, `μ`, `σ`…) est souligné en
pointillé et affiche sa définition au survol ou au focus clavier, dans le texte
comme dans les en-têtes du tableau (`content/symbols.js`).

Le tableau des élèves change de colonnes à chaque étape : notes, `x`, `z`, `p`,
`ℓ`, `p − y`, contributions au gradient, réponse, cas. Sa ligne de pied donne
`J`, la somme des contributions et le gradient, la correction des trois poids ou
le bilan des plis. La matrice de confusion et les scores par maison s'affichent
au-dessus du tableau. Le calcul déroulé réécrit l'opération de l'étape avec les
nombres de l'élève sélectionné. Un clic sur un nom change d'élève.

Un clic, Entrée ou Espace sur une miniature la met en tête et ramène la colonne
en haut. Sur la figure de tête, la même action l'ouvre en superposition.
`Fermer`, un clic sur le voile ou Échap la referment.

Deux notes sont absentes du scénario. Le tableau les remplace par un tiret à
l'étape Données, puis affiche la valeur imputée, signalée, aux étapes
suivantes.

Sans validation croisée, l'entraînement n'est exécuté qu'une fois, sur les 25
élèves d'apprentissage. Les étapes de la branche des plis, la colonne `pli` du
tableau et le sélecteur de passage disparaissent, et la frise ne porte que le
modèle final. Avec la validation croisée, l'entraînement est exécuté six fois :
une fois par pli, ce pli mis de côté, puis sur les 25 élèves d'apprentissage
pour le modèle final. Chaque passage refait la médiane, μ, σ et la descente sur
ses seuls élèves d'entraînement (`src/dataset.js`). Comme dans
`cross_validation.py`, un tour de la boucle des plis enchaîne la préparation,
la descente et l'évaluation du pli. Après la décision, `Suivant` mène à
l'évaluation, puis repart à la médiane avec le pli suivant. Après le cinquième
pli viennent le bilan et la matrice de confusion hors pli, puis le modèle
final, qui passe de la décision à la prédiction. Les plis sont stratifiés comme
dans le projet, maison par maison en repartant du premier pli. Ils suivent
l'ordre du fichier, sans le tirage aléatoire du projet.

Le jeu a trois maisons, le projet quatre. Chaque passage entraîne trois modèles
un contre tous, chacun par sa propre descente, puis attribue la maison du plus
grand score. Les étapes de la boucle montrent le modèle de la maison en cours.
La décision et les étapes suivantes montrent les trois modèles à l'arrêt, et la
figure Frontière passe alors aux trois régions du plus grand score. Les
matrices de confusion sont 3 × 3. La précision, le rappel et le F1 sont donnés
par maison, sur les élèves d'entraînement à l'étape Décision et hors pli à
l'étape Validation.

La frise met les descentes bout à bout, dix-huit avec la validation croisée,
trois sans. Elle compte un segment par passage, chacun coupé en trois segments
de maison de même largeur, de l'itération 0 à l'arrêt. Le curseur, les sauts
`±1` et `±10` et les flèches du clavier la parcourent d'un seul tenant :
au-delà de l'arrêt d'un passage, le déplacement continue au début du suivant.
Les commandes restent actives partout. Hors de l'entraînement, toucher à la
frise, aux sauts ou à la lecture ramène au score, au point choisi, et choisir
un passage mène à sa médiane. Dans l'entraînement, le sélecteur mène au début
du passage, ou à son arrêt après la boucle. Sur l'évaluation d'un pli, il
choisit le pli évalué. Un glissement n'applique que la dernière position de
chaque image.

`Lecture` parcourt chaque descente en quatre secondes, quelle que soit sa
longueur, marque une courte pause à son arrêt, puis continue au début de la
suivante, jusqu'à l'arrêt du dernier modèle final. Un saut manuel ou le curseur
l'interrompent.

Au clavier, les flèches gauche et droite parcourent le cours, la barre d'espace
lance et arrête la lecture, Échap referme un agrandissement.

Chaque panneau porte son bouton de repli, un chevron qui pointe dans la
direction du repli. Celui du schéma est en haut à droite, celui des figures en
haut de leur colonne. Les deux panneaux sont déployés à chaque chargement.
Replié, le schéma laisse une bande à ses boutons, la colonne des figures un
rail au sien, et le cours prend la largeur libérée. À côté du repli du schéma,
le bouton de thème bascule entre clair et sombre, et le choix est gardé dans le
navigateur. Sans choix, la page suit la préférence du système. Les figures sont
redessinées aux couleurs du nouveau thème.

## Lisibilité

Les couleurs viennent des échelles
[Radix Colors](https://www.radix-ui.com/colors), en clair et en sombre : gris
mauve pour les fonds et le texte, un seul accent violet réservé au parcours
(étape courante, boucle active, commandes d'itération). Les maisons reprennent
le rouge, le jaune et le vert des graphiques Python (échelles red, amber,
grass), et les erreurs de classement sont en cyan. Les titres, les libellés et
les boutons sont en Space Grotesk, le texte en IBM Plex Sans, les nombres en
JetBrains Mono, qui porte aussi le grec et les symboles mathématiques.

L'habillage est celui d'une interface de jeu : boutons et puces en hexagone
étiré, traits fins en dégradé rose, violet et bleu ciel (figure commentée,
calcul déroulé, libellés, titre de l'étape), boutons pleins du violet au
magenta, nœud courant cerclé de citron, fond en nid d'abeilles
([Hero Patterns](https://heropatterns.com), CC BY 4.0). Le rose, le bleu ciel
et le citron ne portent aucune information. Les cadres ont les coins coupés là
où le navigateur connaît `corner-shape`, arrondis ailleurs. Les boutons sont
découpés par `clip-path` dans tous les navigateurs.

Le texte de l'interface tient le seuil AAA de 7:1 sur son fond, sauf
l'étiquette d'un bouton plein, à 4,5:1. Les couleurs de données tiennent 4,5:1
et les traits de figure 3:1. En clair, les pas 11 de Radix sont assombris juste
assez pour tenir ces seuils. `verifie_contraste.py` contrôle chaque paire dans
les deux thèmes et échoue si l'une descend sous son seuil.

Le corps de base est de 16 px, le plus petit corps de 13 px, et la longueur de
ligne est bornée à 62 caractères.

La grille parcours, cours et figures ne s'applique qu'au-delà de 78 rem de
large et 40 rem de haut. En dessous de l'une de ces dimensions, la page est un
document qui défile, et à 200 % de zoom la mise en page repasse d'elle-même en
colonne unique. La console tient sur deux lignes au-delà de 94 rem, sur trois
en dessous. Le calcul passe à droite du texte quand la colonne de cours dépasse
60 rem. Le schéma garde une largeur minimale et défile seul sur un écran
étroit.

Chaque distinction porte une marque de forme en plus de sa teinte. Les maisons
se distinguent par le carré et le disque sur les figures, et par la valeur de
`y` dans le tableau. Une observation mal classée porte un filet cyan à gauche
de sa ligne et une croix. Les animations du schéma s'arrêtent sous
`prefers-reduced-motion`.

Chaque tracé est un `role="img"` dont le nom accessible est réécrit à chaque
rendu. Le changement d'étape et le changement d'itération sont annoncés dans une
région `aria-live`, avec un retard de 400 ms pour qu'un glissement du curseur ne
produise qu'une annonce. Les deux scènes en relief n'ont pas d'équivalent au
clavier. Leur orientation de départ est celle qui se lit le mieux.

Le plan des notes est tracé à échelles égales sur les deux axes, et la ROC dans
un carré. Les bornes de l'axe le moins étiré sont élargies pour que l'angle de
la frontière reste juste. Le cadre de tracé garde le rapport 4:3. Les valeurs
qu'une figure fixe sans les montrer sont écrites dans l'en-tête de sa carte :
la section `w₀` de la trajectoire, la hauteur où son relief est coupé, l'aire
sous la ROC.

## Le débordement

L'étape Stabilité numérique porte un atelier : un curseur sur `z`, et les mêmes
expressions en écriture directe et en écriture stable.

| z | `σ` directe | `σ` stable | `ln(1+e^z)` directe | stable |
|---|---|---|---|---|
| -710 | 0 | 4,48e-309 | 0 | 0 |
| +710 | 1 | 1 | **+∞** | 710 |

Au-delà de `\|z\| ≈ 709,8`, `exp` dépasse la borne du flottant double. En
JavaScript, la perte cesse d'être un nombre. En Python, `np.exp(750)` renvoie
`inf` avec un avertissement.

## Le jeu de données

Le jeu compte 25 élèves d'apprentissage (10 Gryffondor, 6 Poufsouffle, 9
Serpentard), 5 élèves réservés à la prédiction et deux matières, avec α = 1.
Deux notes, proches de la médiane de leur matière, sont effacées après la
sélection (`MISSING`) pour que l'imputation ait des valeurs à remplacer.

`construire_scenario.py` place d'abord Gryffondor et Serpentard. Il balaie une
liste de réglages et retient le premier qui tient toutes les bornes (norme
finale entre 2,5 et 9, dernier basculement entre la vingtième et la
trois-centième itération, au moins deux basculements après le dixième, quatre
paliers d'exactitude, plafond de 700 itérations). Le script obtient ces
propriétés par le conditionnement. Les deux notes covarient, et cette direction
de plus grande variance est sans rapport avec l'étiquette, qui dépend d'un
écart perpendiculaire plus étroit.

Poufsouffle est ajoutée au bout de l'axe commun. Ses élèves sont bons dans les
deux matières et recouvrent le haut de la bande des deux autres maisons. Placée
plus loin, la maison devenait séparable et son modèle s'arrêtait sur la limite.
Placée plus près, la décision tombait sous 75 % d'élèves bien classés. Le
script affiche les trois modèles un contre tous.

Dans `scenario.csv`, les élèves de Poufsouffle sont répartis à intervalles
réguliers parmi les autres. Les élèves réservés et les deux notes effacées sont
désignés avant cette répartition. Avec une ligne réservée sur six du fichier
final, le modèle de Poufsouffle s'arrête sur la limite dans deux plis.

| passage | arrêts G, P, S | pli évalué | entraînement |
|---|---|---|---|
| pli 1 | 1617, 1880, 2949 | 3 / 6 | 16 / 19 |
| pli 2 | 458, 961, 266 | 5 / 5 | 14 / 20 |
| pli 3 | 416, 720, 308 | 5 / 5 | 16 / 20 |
| pli 4 | 502, 1696, 372 | 4 / 5 | 17 / 20 |
| pli 5 | 588, 1620, 350 | 3 / 4 | 17 / 21 |
| final | 554, 1089, 399 | — | 20 / 25 |

La validation croisée classe bien 20 élèves sur 25 hors pli, soit 80 %. Le F1
est de 85,7 % pour Gryffondor, 66,7 % pour Poufsouffle et 82,4 % pour
Serpentard. Le modèle final classe bien 3 des 5 élèves réservés.

Une descente arrêtée par la limite est relancée sans elle au chargement, et le
cours donne l'itération où le critère l'aurait arrêtée. Quand les élèves d'une
maison sont séparables par une droite, J n'a pas de minimum et `‖∇J‖` ne
décroît qu'à peu près comme 1/t.

## Cohérence avec le code Python

`src/model.js` est un portage de la descente de `dslr/model.py` : sigmoïde à
deux branches, softplus, critère d'arrêt sur la norme du gradient mesurée avant
la mise à jour des poids.

Le portage a été contrôlé sur le jeu des anciens slides, avec α = 1. Chaque
valeur de ce jeu se recalcule à la main et était vérifiée par
`construire_cas.py`, retiré du dépôt avec les slides :

| grandeur | JavaScript | `construire_cas.py` |
|---|---|---|
| `J` à w = 0 | 0,693147 | ln 2 |
| w à l'itération 1 | 0,100 -0,275 +0,2575 | identique |
| w à l'arrêt | 0,6037 -1,0294 +0,5141 | 0,603740 -1,029417 +0,514094 |
| erreurs | 4 / 20 | 4 |
| exactitude, précision, rappel | 80,0 / 83,3 / 83,3 % | identiques |

## Contrôles

    python3 docs/demo/scripts/verifie_contraste.py   # 42 paires, dans chaque thème
    python3 docs/demo/scripts/verifie_figures.py     # les sept figures dans un navigateur
    node docs/demo/scripts/verifie_fiches.mjs        # fiches et noms accessibles des figures, à chaque passage : ni valeur absente, ni nombre non arrondi, ni pluriel après 1
    python3 docs/demo/scripts/construire_scenario.py # régénère et vérifie le scénario (calculs dans scenario_calcul.py)
    python3 docs/demo/scripts/exporter_donnees.py    # régénère src/data.js

## Démarrage

L'écran de démarrage occupe la page pendant que `src/boot.js` attend MathJax
et les polices, calcule les six passages (une préparation et trois descentes
chacun), puis le bilan de la validation croisée. Tout est calculé quelle que
soit l'option, car elle peut changer jusqu'à `Démarrer`. Chaque étape rend la
main au navigateur pendant une durée minimale pour que la jauge soit lisible,
car le calcul réel ne prend que quelques dizaines de millisecondes. `Démarrer`
recopie les options dans `src/config.js`, place le premier passage, charge le
cours, monte les vues et attend l'écriture de la première formule. La page,
masquée mais déjà mise en place, apparaît ensuite.

## Fichiers

Aucun fichier de `src/` ou de `css/` ne dépasse 200 lignes.

    index.html                   la page et les identifiants que les vues cherchent

    css/tokens.css               palette et échelle typographique
    css/base.css                 éléments, champs, anneau de focus, bulles des symboles
    css/controls.css             boutons hexagonaux, outils des panneaux, logo
    css/shell.css                grille de page, panneaux repliables
    css/start.css                écran de démarrage : jauge, configuration
    css/flow.css                 schéma du parcours
    css/console.css              console : groupes, boutons, mesures, mises en page
    css/frise.css                frise des descentes et curseur
    css/lesson.css               colonne de cours, fiche, détail
    css/lab.css                  ateliers
    css/calc.css                 calcul déroulé, tableau des élèves, matrice de confusion
    css/figures.css              colonne des figures et agrandissement

    src/boot.js                  démarrage : chargement, calcul, Démarrer, montage
    src/config.js                options de l'écran de démarrage
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
    src/content/steps/nodes.js   les nœuds du schéma
    src/content/steps/format.js  mise en forme commune aux fiches
    src/content/symbols.js       définition de chaque symbole, affichée au survol
    src/content/labs.js          les ateliers attachés à une étape

    src/figures/canevas.js       palette, repère, grille, marqueurs
    src/figures/scene.js         socle des deux figures en relief, sur Plotly
    src/figures/frontiere.js     le plan des deux notes : modèle en cours, puis régions
    src/figures/scores.js        les scores z sur une droite graduée
    src/figures/sigmoide.js      la sigmoïde et les scores des élèves
    src/figures/surface.js       la surface de probabilité
    src/figures/perte.js         J en fonction de l'itération
    src/figures/chemin.js        la trajectoire des poids sur le relief de J
    src/figures/roc.js           la courbe ROC et son aire
    src/figures/index.js         registre et ordre des cartes

    src/views/loader.js          jauge du calcul
    src/views/start.js           configuration et Démarrer
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
    src/views/panels.js          repli du parcours et des figures
    src/views/theme.js           bascule clair / sombre

    vendor/tex-svg.js            MathJax, rendu des formules
    vendor/plotly-gl3d.min.js    Plotly 3.7.0, bundle gl3d, pour les deux reliefs
    vendor/*.woff2               Space Grotesk, IBM Plex Sans, JetBrains Mono ; licences OFL à côté

Les deux bibliothèques et les polices sont dans le dépôt, donc la page ne
demande rien au réseau et s'ouvre depuis un disque. `plotly-gl3d` est le bundle
partiel : surfaces et nuages en trois dimensions, sans les tracés plats, dont
les cinq autres figures n'ont pas besoin.

Une figure déclare `dom: true` quand son tracé s'écrit dans un élément plutôt
que sur un canevas. `views/figures.js` lui passe alors le conteneur, sa taille
et l'état d'agrandissement, au lieu d'un contexte 2D.

Une vue ne connaît que sa zone de la page et les canaux auxquels elle
s'abonne : `step` pour ce qui change d'étape en étape, `model` pour un
changement de passage ou de maison, `iteration` pour ce qui suit la descente.
Cette séparation évite de retypographier la formule à chaque cran du curseur
d'itération.
