# Audit critique du cours « Régression logistique »

Date de l'audit : 1er août 2026  
Document audité : `regression_logistique.tex` et son PDF de 104 pages  
Périmètre complémentaire : chapitres, scripts de tutoriel, scripts de figures, bibliographie et artefacts du projet DSLR

## Verdict exécutif

**Décision : refus de publication en l'état.**

Oui : j'aurais honte de présenter ce document comme un cours fini « de niveau MIT, accessible à tous ». Je n'aurais pas honte du travail produit : le corpus graphique est riche, la mise en page est propre et certaines intuitions sont remarquablement bien montrées. J'aurais honte de la promesse, parce que le document inspire une confiance académique que son contenu ne mérite pas encore.

Ce n'est pas une mauvaise maquette. C'est plus dangereux : **une très belle maquette qui enseigne plusieurs erreurs centrales avec assurance**. Le cours comporte notamment une fuite de données dans son évaluation, un coût qui plante exactement sur le cas extrême qu'il prétend gérer, une fausse preuve d'unicité, de fausses garanties sur la descente de gradient et une figure de trajectoire scientifiquement trompeuse.

Le bon diagnostic est donc :

> **excellent matériau visuel et narratif ; cours non fiable, non accessible et non publiable sans reconstruction.**

La note globale indicative est **3/10**. Le rendu visuel vaut nettement mieux ; la fiabilité scientifique et la conception pédagogique tirent l'ensemble vers le bas.

| Axe | Note | Verdict |
|---|---:|---|
| Mise en page et lisibilité visuelle | 8/10 | solide |
| Intuitions et fil rouge numérique | 7/10 | matériau à conserver |
| Exactitude mathématique et statistique | 3/10 | échec |
| Fiabilité du code enseigné | 3/10 | échec |
| Protocole d'évaluation | 2/10 | échec |
| Pédagogie active | 1/10 | pratiquement absente |
| Accessibilité pour débutants | 3/10 | surcharge et prérequis cachés |
| Accessibilité numérique | 2/10 | PDF non balisé |
| Traçabilité académique | 2/10 | sources décoratives, peu reliées au texte |
| État de publication | 2/10 | arrêt immédiat avant diffusion |

## Mesures objectives

- 104 pages PDF, dont 98 pages numérotées de contenu et références ;
- 17 chapitres, 68 sections et 4 632 lignes de LaTeX ;
- environ 25 700 mots ;
- 62 figures, 14 tableaux, 12 extraits de code et 9 sorties console ;
- 22 encadrés « résultat » et 12 encadrés « vigilance » ;
- **zéro exercice, zéro quiz, zéro problème de transfert, zéro corrigé** ;
- une seule annexe, alors que la partie « Démontrer » occupe les pages 72 à 94 et que des développements avancés encombrent déjà la partie « Voir » ;
- cinq références ajoutées globalement avec `\nocite{*}`, mais une seule occurrence de `\cite{...}` dans les chapitres ;
- PDF non balisé (`Tagged: no`), sans langue déclarée, sans structure de lecture, sans texte alternatif et avec un champ auteur PDF vide ;
- compilation actuelle sans référence indéfinie, mais avec une boîte trop large de 12,5 points dans `p2_predire.tex:123-125` et une destination PDF `equation.11.1` dupliquée.

## Ce qui mérite d'être sauvé

Il serait absurde de jeter tout le document. Plusieurs choix sont réellement bons :

1. **Le même exemple numérique suit tout le cours.** Les notes, coefficients, scores et coûts peuvent être suivis d'un chapitre à l'autre.
2. **La chaîne note brute → standardisation → score → sigmoïde** est souvent expliquée avec clarté (`chapters/p1_probabilite.tex:69-188`).
3. **Les figures géométriques sont généralement lisibles et cohérentes graphiquement.** La frontière, le vecteur normal et les contributions au score sont de bons supports d'intuition.
4. **La distinction entre exactitude discontinue et coût dérivable** est une bonne question pédagogique (`chapters/p1_erreur.tex:235-321`), même si une conclusion voisine est ensuite suraffirmée.
5. **La vérification du gradient par différences finies** est une excellente habitude à enseigner (`chapters/p2_entrainer.tex:15-79`).
6. **Le document pense au contexte du modèle enregistré** : ordre des colonnes, statistiques de préparation et ordre des classes (`chapters/p1_classifieur.tex:264-321`).
7. **Il aborde des sujets souvent omis** : stabilité flottante, séparabilité, one-vs-rest et somme incohérente de ses sorties.
8. Les fontes sont incorporées, le texte est extractible et le PDF possède des signets hiérarchiques utiles.

Le problème n'est donc pas un manque de travail. C'est un manque de sélection, de validation et de hiérarchisation.

## P0 — erreurs qui interdisent toute diffusion

### 1. Le jeu de test fuit dans l'apprentissage

Le chapitre promet une mesure sur des élèves « jamais vus » (`chapters/p2_predire.tex:85-93`). Le code fait l'inverse :

- `scripts/tuto/step9_holdout.py:33-36` appelle d'abord `load()` sur les 1 600 élèves, puis découpe les indices ;
- `scripts/tuto/step4_total_cost.py:15-30` calcule avant ce découpage la médiane, la moyenne et l'écart-type sur les 1 600 lignes ;
- les deux matières ont elles-mêmes été choisies après observation de leur pouvoir séparateur sur l'ensemble étiqueté (`chapters/p1_standardisation.tex:18-20`).

Le test a donc influencé le prétraitement et la sélection des variables. Le pipeline correct doit être :

1. découper les lignes brutes ;
2. choisir ou valider les variables sur apprentissage/validation uniquement ;
3. ajuster médianes, moyennes et écarts-types sur l'apprentissage uniquement ;
4. transformer apprentissage, validation et test avec ces statistiques figées ;
5. ne consulter le test qu'une seule fois.

Le `0,9719` se reproduit et, sur ce découpage particulier, un prétraitement corrigé donne par hasard le même `311/320`. Cela ne répare pas le protocole : une fuite reste une fuite même lorsqu'elle ne change pas l'arrondi final. La sélection préalable des deux matières reste contaminée.

Même en supposant le protocole valide, `311/320 = 97,19 %` ne justifie pas quatre décimales de certitude. L'intervalle de Wilson à 95 % est approximativement **[94,74 % ; 98,51 %]**. Il manque plusieurs graines, une validation croisée ou au minimum une incertitude, une matrice de confusion réellement affichée et des mesures par classe.

Le « dépasse 98 % » annoncé avec dix matières (`chapters/p1_classifieur.tex:376-380`) vaut bien `1571/1600 = 98,1875 %`, mais sur les données d'entraînement. Le texte ne le signale pas à cet endroit et ne fournit pas le protocole hors échantillon correspondant.

### 2. Le coût du tutoriel plante sur les scores extrêmes

`scripts/tuto/step2_sigmoid.py:4-7` renvoie volontairement `0.0` pour un score très négatif. Puis `scripts/tuto/step3_single_cost.py:5-8` évalue les deux logarithmes :

```python
p = sigmoid(score)
return -(expected * log(p) + (1 - expected) * log(1 - p))
```

Le texte affirme que le facteur nul annule le terme **avant** l'évaluation du logarithme (`chapters/p2_donnees.tex:138-140`). C'est faux en Python : les deux appels à `log` sont évalués avant les multiplications.

Reproduction :

```text
student_cost(-800, 0)
ValueError: expected a positive input, got 0.0
```

La partie sur la stabilité reconnaît ensuite le problème et annonce `softplus(z)-yz` comme « forme employée par le programme » (`chapters/p3_stabilite.tex:57-64`), alors que le tutoriel montré au lecteur emploie toujours la forme instable.

La correction doit être dans le tronc commun, pas seulement démontrée 35 pages plus tard : `log1p`, softplus protégée et tests explicites en `z = ±1000`.

### 3. La convexité est vendue comme une preuve d'unicité

Le chapitre s'intitule « Unicité du minimum » et annonce que le coût « n'en admet qu'un » (`chapters/p3_convexite.tex:1-8`). Le calcul démontre seulement que la Hessienne est semi-définie positive, donc que le coût est convexe.

Or le même chapitre reconnaît ensuite :

- des directions de courbure nulle et un sous-espace entier de minima (`chapters/p3_convexite.tex:115-126`) ;
- l'absence de minimum fini en cas de séparation complète (`chapters/p3_convexite.tex:128-136`).

Malgré cela, il conclut encore que la convexité « garantit l'unicité du minimum lorsqu'il existe ». C'est faux. Il faut distinguer quatre résultats :

- convexité : pas de minimum local parasite ;
- stricte convexité/identifiabilité : unicité éventuelle, sous conditions de rang ;
- existence du maximum de vraisemblance : mise en défaut par séparation ou quasi-séparation ;
- convergence de l'algorithme : dépend aussi du pas et du critère d'arrêt.

Les affirmations « quel que soit le point de départ » de `chapters/p1_descente.tex:62-64` et `chapters/p3_convexite.tex:107-113` sont donc trop fortes.

Autre erreur du même passage : des colonnes proportionnelles créent une direction plate, mais une descente de gradient exacte ne « dérive » pas spontanément le long de cette direction ; le gradient lui est orthogonal. Les coefficients sont non identifiables, ce qui n'est pas la même chose qu'une dérive algorithmique automatique.

### 4. Les garanties sur le taux d'apprentissage sont fausses

`chapters/p1_descente.tex:442-480` affirme notamment :

- que le déplacement reste borné quel que soit `alpha` ;
- qu'un pas excessif allonge la trajectoire sans faire exploser les valeurs ;
- que l'oscillation du cas quadratique suppose une courbure croissant avec la distance ;
- que la borne `p(1-p) <= 1/4` suffit à justifier le comportement.

Tout cela est faux ou incomplet.

- Le pas vaut `-alpha * gradient` : il n'est évidemment pas borné quand `alpha` tend vers l'infini.
- La Hessienne par rapport aux coefficients vaut `X^T S X / m`. La borne `1/4` porte sur `S`, pas sur toute la Hessienne ; l'échelle et les corrélations de `X` comptent.
- Une fonction quadratique a une courbure constante. Avec un pas critique elle peut osciller, et avec un pas plus grand elle diverge. La propre figure du document illustre donc un contre-exemple à sa légende.
- La direction de plus forte décroissance est **l'opposé** du gradient, pas le gradient lui-même (`chapters/p1_descente.tex:365-371`).

Un cours sérieux doit donner une affirmation conditionnelle : pour une fonction à gradient `L`-Lipschitz, un pas suffisamment petit — typiquement inférieur à `2/L` dans le cas convexe quadratique — permet une convergence appropriée. Ici `L` dépend des données.

### 5. Une figure centrale fabrique une fausse trajectoire de gradient

Les figures `surface3d.png` et `contours.png` sont présentées comme une surface de coût à biais fixé, parcourue par la trajectoire réelle, laquelle couperait les niveaux perpendiculairement (`chapters/p1_descente.tex:318-355`). Le script ne calcule pas cela :

- `scripts/gen_3d.py:40-47` produit une vraie descente en trois coefficients, avec un biais qui varie ;
- `scripts/gen_3d.py:49-55` construit ensuite une tranche 2D où le biais est fixé à sa valeur finale ;
- `scripts/gen_3d.py:57-58` projette les couples `(w1,w2)` de la trajectoire 3D sur cette tranche et **recalcule leurs altitudes** avec le biais final ;
- `scripts/gen_3d.py:76-80` appelle alors le point projeté « départ, J=0,98 » et l'arrivée « minimum ».

Ce tracé hybride n'est ni la trajectoire d'entraînement réelle — dont le coût initial vaut `log(2) = 0,693` — ni une descente de gradient sur la tranche affichée. Rien ne permet d'affirmer qu'il coupe ses courbes de niveau perpendiculairement.

Il faut choisir :

- soit exécuter une vraie descente 2D avec le biais fixé et la décrire comme telle ;
- soit montrer la trajectoire 3D complète ;
- soit afficher une projection, clairement nommée projection, sans lui attribuer les propriétés du gradient de la tranche.

### 6. Le cours confond la dérivée de la sigmoïde et le gradient de la perte

`chapters/p3_sigmoide.tex:109-111` conclut que les élèves proches de la frontière contribuent « au maximum » au déplacement parce que `sigma'(z)` y vaut `1/4`.

Le chapitre suivant démontre pourtant que, pour l'entropie croisée, ce facteur se simplifie :

```text
d loss / dz = p - y
```

Un exemple mal classé avec assurance contribue donc en valeur absolue près de `1`, contre `0,5` sur la frontière, avant multiplication par les variables. Le texte correct de `chapters/p1_descente.tex:50-58` contredit ainsi directement `chapters/p3_sigmoide.tex:109-111`.

Même confusion dans `chapters/p1_erreur.tex:51-55` et `227-232` : un coût individuel peut devenir immense tandis que `p-y` sature à `±1`. Un coût énorme n'implique pas un gradient proportionnellement énorme.

### 7. L'arrêt de la boucle ne fait pas ce que le texte annonce

`scripts/tuto/step7_loop.py:10-16` est décrit comme un arrêt sur baisse relative. Dans les expériences du cours, `cost < 1`, donc :

```python
abs(previous - cost) / max(1, abs(cost))
```

est simplement une différence **absolue**. L'usage de `abs` accepterait aussi une petite hausse. Au chemin `MAX_ITER`, les poids retournés ont déjà reçu un pas supplémentaire alors que le coût retourné correspond aux poids précédents.

L'annexe affirme en outre que, sur des données séparables, seul le plafond peut arrêter la boucle (`chapters/annexe_norme.tex:17-22`). C'est faux avec ce critère : puisque les baisses de coût tendent vers zéro, le test de stagnation peut se déclencher alors que la norme continue de croître et qu'aucun minimum fini n'existe.

La phrase « la cause est alors dans les données, pas dans le programme » (`chapters/annexe_norme.tex:130-135`) est également dangereuse : divergence et saturation peuvent parfaitement provenir d'un pas, d'un bug ou d'un calcul instable.

### 8. L'exemple de sous-dépassement est numériquement faux

`chapters/p3_cout.tex:40-44` affirme que :

```text
0,9^1600 ≈ 10^-73
```

s'arrondit à zéro en machine. La première approximation est raisonnable (`6,14 × 10^-74`), la conclusion ne l'est pas : ce nombre est très loin du plus petit double normal, environ `2,2 × 10^-308`.

Le problème général du produit de nombreuses probabilités est réel ; cet exemple ne le démontre pas. `0,5^1600`, par exemple, sous-dépasse effectivement le domaine des doubles.

### 9. La table de stabilité mélange deux classes

Dans `chapters/p3_stabilite.tex:134-147`, la ligne `z=+40` montre `log(1-sigma(40)) = log(0)`, ce qui correspond à la classe négative et à un coût voisin de `40`. La colonne « écriture protégée » donne pourtant `0,0`, résultat du cas positif bien classé.

La ligne compare deux quantités différentes. Elle doit expliciter `y` et donner, pour la même observation :

- `y=0, z=40` : coût proche de `40` ;
- `y=1, z=40` : coût proche de `0`.

## P1 — erreurs et suraffirmations importantes

### Objectif d'optimisation et exactitude

`chapters/p1_erreur.tex:163-167` affirme que « placer la frontière » et minimiser la log-loss ont la même réponse. Le tableau des lignes 258-282 montre lui-même le contraire : deux frontières de même exactitude peuvent avoir des coûts différents et le minimum du coût ne coïncide pas nécessairement avec le minimum du nombre d'erreurs.

Il faut dire pourquoi la log-loss est choisie — vraisemblance, règle de score propre, différentiabilité — sans prétendre qu'elle optimise directement l'exactitude à seuil fixé.

### Seuil, déséquilibre et minimum mal mesuré

`chapters/p1_probabilite.tex:307-325` attribue le meilleur seuil empirique supérieur à `0,5` au déséquilibre des classes. À coûts symétriques et probabilités conditionnelles correctement estimées, le seuil de décision de Bayes reste `0,5`, même si les classes sont déséquilibrées. Un déplacement empirique peut venir de la calibration, de la misspécification ou du bruit d'échantillonnage.

Le minimum annoncé à 31 erreurs est lui-même raté par la grille grossière du script : un seuil dans l'intervalle approximatif `(0,582342 ; 0,583529]` produit 30 erreurs. Une recherche sur 300 points (`scripts/gen_seuil.py:41-45`) ne prouve pas un optimum exact.

### Interprétation des coefficients et du biais

- `chapters/p1_modele.tex:25-29` appelle la valeur absolue d'un coefficient standardisé le « poids » ou l'importance d'une matière. Avec des variables corrélées, il s'agit d'un effet conditionnel sur la log-cote, pas d'une importance autonome ni causale.
- `chapters/p1_modele.tex:31-34` fait du biais un reflet direct de la fréquence de base. Avec des covariables, l'interception est la log-cote prédite pour `x=0`; elle n'est pas en général le logit de la prévalence marginale.
- Le début du chapitre affirme que les coefficients sont « seuls à conserver » (`chapters/p1_modele.tex:4-7`), puis reconnaît qu'il faut aussi les statistiques de préparation, l'ordre des variables et l'association de classe (`chapters/p1_modele.tex:97-137`). Le second énoncé est le bon.

### Statut des sorties one-vs-rest

Le document emploie régulièrement « probabilité » et « assurance », puis montre que les quatre sorties peuvent sommer à `0,129` ou `1,845` (`chapters/p1_classifieur.tex:323-374`). Ce sont des sorties sigmoïdées de quatre problèmes binaires indépendants ; elles ne constituent pas automatiquement une distribution multiclasses cohérente ni calibrée.

L'argmax one-vs-rest reste une règle de décision possible. En revanche, afficher ces nombres comme « 95 % de chances d'être dans telle maison » exige calibration et validation, ou un modèle multinomial cohérent.

L'argument selon lequel les quatre scores seraient comparables parce que les entrées sont standardisées et que la même sigmoïde est appliquée (`chapters/p1_classifieur.tex:109-116`) n'est pas une garantie de calibration inter-modèles.

### Surapprentissage

`chapters/p2_predire.tex:177-184` affirme que l'écart apprentissage-test est le **seul** révélateur du surapprentissage et que trois coefficients par maison « n'offrent pas assez de liberté » pour surapprendre. Les deux affirmations sont fausses.

Un petit modèle peut surapprendre après sélection de variables, réglage répété, petit échantillon ou données bruitées. Courbes d'apprentissage, validation croisée et comparaison des pertes sont aussi des outils de diagnostic.

### Imputation moyenne

`chapters/p1_standardisation.tex:50-55` rejette la moyenne parce que l'imputer reviendrait à « la calculer à partir d'elle-même ». On peut parfaitement calculer la moyenne des valeurs observées puis l'imputer ; la moyenne finale reste alors cette même valeur, sans circularité.

La médiane peut être défendue par robustesse aux valeurs extrêmes et après discussion du mécanisme de données manquantes. Le faux argument doit disparaître. Le script pédagogique prend en outre l'élément supérieur plutôt que la médiane usuelle lorsque l'effectif observé est pair (`scripts/tuto/step4_total_cost.py:15-21`).

### La standardisation ne conserve pas la géométrie annoncée

`chapters/p1_standardisation.tex:157-164` affirme que la transformation conserve les rapports de distances, puis les lignes 197-201 qu'elle conserve la forme et les positions relatives du nuage. Ce serait vrai pour une translation suivie d'une mise à l'échelle **uniforme**. Ici les deux axes sont divisés par `5,175` et `105,186` : la transformation est anisotrope.

Elle conserve l'ordre sur chaque coordonnée, les alignements et plus généralement la structure affine. Elle ne conserve pas les distances euclidiennes, leurs rapports en général, les angles ni la forme métrique. La géométrie obtenue après standardisation est un choix de métrique utile, pas la géométrie inchangée des données brutes.

### Le logit est choisi, pas découvert par nécessité

`chapters/p3_logit.tex:4-8` promet d'obtenir la fonction logistique « plutôt que d'en postuler une », puis les lignes 94-102 justifient l'égalité entre score et log-cote parce que les deux parcourent les réels. Cette correspondance ne force rien : une infinité de bijections conviennent, ce que le document reconnaît lui-même lorsqu'il cite le modèle probit (`chapters/p1_nuage.tex:455-464`).

Le lien logit est une hypothèse de modélisation motivée par son interprétation en log-cotes, la vraisemblance de Bernoulli et ses propriétés calculatoires. Ce n'est pas une conséquence algébrique du domaine des deux variables. L'appeler « unique hypothèse » oublie aussi l'indépendance conditionnelle des observations introduite dans `chapters/p3_cout.tex:28-38`.

### Géométrie suraffirmée

- Les Gryffindor n'occupent pas « seuls » le quadrant indiqué (`chapters/p1_nuage.tex:67-70`) : les données contiennent aussi six élèves d'autres maisons dans ce quadrant, et 23 Gryffindor ailleurs.
- Une région d'argmax de fonctions affines est une intersection convexe de demi-plans, éventuellement vide ou non bornée. Si elle est non bornée, toutes ses arêtes ne sont évidemment pas de longueur finie, contrairement à `chapters/p1_classifieur.tex:191-198`.
- En cas d'égalité exacte, `argmax` a besoin d'une règle de départage. Il ne donne pas mathématiquement une classe unique sans convention.

### Incohérences numériques non relues

Plusieurs phrases ne concordent pas avec les propres fichiers de données du cours :

- `chapters/p1_descente.tex:129-132` dit que les dix premiers tours réalisent deux tiers de la baisse ; ils en réalisent environ **75,7 %** entre les itérations 0 et 400 ;
- le même passage dit que les 350 derniers tours n'agissent que sur la quatrième décimale, alors que le coût passe de `0,143846` à `0,108113`, soit `0,035733` ;
- `chapters/p1_descente.tex:408-425` dit que `alpha=100` fait remonter le coût dès le premier pas, tandis que `data/alpha.dat` donne `0,693147 → 0,408290`, puis une nouvelle baisse ;
- la partie I appelle les coefficients de l'itération 400 le modèle « obtenu », les figures multiclasse utilisent 600 tours (`scripts/gen_regions.py:39-45`) et le tutoriel s'arrête entre 544 et 652 tours ; ces états différents ne sont pas versionnés ni étiquetés clairement ;
- `chapters/p1_modele.tex:97-102` compte « quatre nombres » de standardisation, alors qu'il faut aussi les deux médianes, soit six statistiques visibles dans sa propre figure ;
- `chapters/p1_nuage.tex:545-549` affirme que le code lit le nombre de colonnes dans le fichier ; le tutoriel en fixe deux et `V.3_Logistic_regression/logreg_train.py:27-31` en fixe dix.
- la notation `||w||` exclut le biais dans les chapitres géométriques, puis semble désigner tous les paramètres dans les chapitres théoriques et la régularisation ; la valeur `4,89` affichée est la norme du seul vecteur normal, tandis que la norme des trois coefficients est voisine de `6,82`.

Ce ne sont pas tous des drames isolément. Leur accumulation montre qu'aucune vérification automatique ne relie actuellement prose, données, scripts et figures.

## Le problème pédagogique

### Ce n'est pas un cours actif

Le document contient 104 pages et **aucun exercice**. Lire, même lire un excellent texte, n'est pas démontrer que l'on sait :

- calculer un score ;
- prévoir le sens d'un gradient ;
- repérer une fuite de données ;
- écrire une perte stable ;
- interpréter une matrice de confusion ;
- transférer le raisonnement à un autre jeu de données.

Un cours ambitieux doit proposer, à chaque chapitre :

1. une question de prédiction avant révélation ;
2. un calcul guidé ;
3. un exercice autonome ;
4. un mini-test de code avec sortie attendue ;
5. un défi d'approfondissement, corrigé en annexe.

### Les prérequis sont cachés

Le lecteur est supposé connaître sans contrat préalable :

- moyenne, médiane, écart-type et données manquantes ;
- exponentielle, logarithme et cotes ;
- vecteurs, produit scalaire, orthogonalité, norme et cosinus ;
- espace affine, dimension et hyperplans ;
- dérivées partielles, règle de chaîne, gradient, Hessienne et forme quadratique ;
- Python, modules, imports, listes en compréhension, dictionnaires, fonctions d'ordre supérieur et arborescence de projet.

Les encadrés `lecture` résument le chapitre, mais ne fournissent ni objectifs observables, ni prérequis, ni durée, ni parcours de secours.

### La difficulté n'est pas en annexe

Le souhait « accessible à tous, difficultés en annexes » n'est pas respecté. Dans le parcours principal apparaissent déjà :

- démonstration géométrique de la distance signée (`chapters/p1_nuage.tex:75-156`) ;
- hyperplans en dimension `n` (`chapters/p1_nuage.tex:467-549`) ;
- largeur `2 log(3)/||w||` de la transition (`chapters/p1_descente.tex:231-270`) ;
- surfaces de coût et lignes de niveau (`chapters/p1_descente.tex:318-363`) ;
- discussion de Hessienne déguisée en réglage de pas (`chapters/p1_descente.tex:365-480`) ;
- géométrie convexe des régions one-vs-rest (`chapters/p1_classifieur.tex:165-263`).

Puis les preuves occupent une troisième partie entière au lieu d'annexes. La seule vraie annexe arrive à la page 95.

### Le document répète au lieu de stratifier

Le logit et la sigmoïde sont introduits dans `p1_nuage`, redérivés dans `p1_probabilite`, puis démontrés à nouveau sur deux chapitres de la partie III. Le coût, le gradient et la stabilité suivent la même logique de répétition.

Une progression en couches serait meilleure :

- une intuition et une formule dans le tronc commun ;
- un exercice d'application immédiat ;
- une preuve et les cas limites en annexe ;
- un lien explicite pour le lecteur avancé.

### Les 62 figures deviennent une surcharge

Le niveau graphique est souvent bon, mais le volume noie la hiérarchie. Trois nappes 3D pleine page aux itérations 1, 10 et 400, plusieurs vues du même coût, plusieurs reprises de la même sigmoïde et des légendes très longues transforment l'explication en catalogue.

Le tronc commun devrait conserver environ 15 à 20 figures décisives. Les traces complètes et variantes peuvent rejoindre un cahier d'annexes ou un notebook reproductible.

## Accessibilité et qualité éditoriale

### Accessibilité numérique

Le PDF n'est pas accessible au sens documentaire :

- aucun balisage structurel ;
- aucune langue PDF déclarée ;
- aucun texte alternatif ;
- équations et diagrammes sans équivalent textuel structuré ;
- plusieurs nuages distinguent les classes uniquement par couleur et utilisent le même marqueur ;
- aucune version testée en niveaux de gris.

Les signets et le texte extractible sont de bons débuts, pas une conformité.

Le rendu comporte aussi quatre pages presque vides réduites à un cartouche (pages imprimées 42, 66, 71 et 77), du code autour de 8,5 points, quelques légendes en `\tiny` et trois figures pleine page dont la largeur laisse environ 1,6 mm de marge physique. Ce n'est pas robuste pour l'impression ni confortable pour tous les lecteurs.

### Positionnement académique

L'abstract se déprécie lui-même : « Le résultat n'est pas formidable » (`regression_logistique.tex:187-189`). La transparence sur l'assistance de GPT et Claude peut rester, mais dans un colophon décrivant les responsabilités, la vérification et la licence — pas sous forme d'excuse dans le résumé.

Il manque :

- public cible et prérequis ;
- objectifs d'apprentissage mesurables ;
- provenance et licence du jeu de données ;
- version stable du cours et historique de révision ;
- citations attachées aux affirmations techniques ;
- protocole de reproduction des chiffres et figures ;
- relecture scientifique signée.

La bibliographie actuelle est solide dans ses titres mais décorative dans son usage : cinq entrées sont imprimées avec `\nocite{*}` (`regression_logistique.tex:222`) et une seule citation apparaît dans le corps (`chapters/p1_nuage.tex:8`).

### Reproductibilité du projet

Les chiffres principaux à deux matières se reproduisent généralement : statistiques brutes, coefficients à l'itération 400, 36 erreurs binaires, sorties des étapes 7 à 9 et sommes one-vs-rest. C'est un point positif.

Mais il n'existe pas de commande unique documentée pour reconstruire le PDF, les données intermédiaires et les figures. Plusieurs conventions cohabitent sans étiquette claire : 400 itérations, 600 itérations dans `scripts/gen_regions.py:39-45`, puis arrêt automatique vers 544–652 tours dans le tutoriel.

À l'échelle du dépôt, `V.3_Logistic_regression/logreg_predict.py` est vide, le README racine est vide, et le Makefile n'offre ni cible `train`, ni `predict`, ni `docs`. Le fichier de poids écrit par `logreg_train.py:93-105` juxtapose en outre des lignes de 4 puis 12 colonnes, format que le lecteur CSV commun rectangulaire ne peut pas relire sans parseur spécialisé — parseur qui n'existe pas dans le prédicteur vide. Cela contredit l'image d'une chaîne DSLR livrable de bout en bout.

## Architecture recommandée

### Tronc commun : 30 à 40 pages maximum

1. **Contrat du cours** — public, prérequis, objectifs, temps, parcours essentiel et parcours avancé.
2. **Le problème en une page** — prédire une classe à partir de notes ; baseline et règle d'évaluation.
3. **Séparer avant de regarder** — apprentissage, validation, test et fuite de données.
4. **Voir une frontière** — deux variables, nuage, score affine, décision.
5. **Préparer sans tricher** — imputation et standardisation ajustées sur l'apprentissage.
6. **Du score à la probabilité** — sigmoïde, interprétation prudente, seuil.
7. **Apprendre les coefficients** — log-loss intuitive, gradient comme recette, un seul pas calculé.
8. **Coder correctement** — version stable, tests unitaires, test de gradient et cas extrêmes.
9. **Évaluer honnêtement** — baseline, matrice de confusion, précision/rappel, log-loss, incertitude et calibration.
10. **Passer à quatre classes** — softmax comme modèle cohérent ; one-vs-rest comme réduction avec limites explicites.
11. **Savoir quand le modèle échoue** — non-linéarité, séparation, régularisation, données manquantes et dérive de distribution.

### Annexes

- A. Rappels : moyenne, écart-type, exponentielle et logarithme.
- B. Vecteurs, produit scalaire, distance signée et hyperplans.
- C. Inversion du logit et propriétés de la sigmoïde.
- D. Vraisemblance et dérivation de la log-loss.
- E. Dérivation complète du gradient.
- F. Convexité, stricte convexité, rang, existence du MLE et séparation.
- G. Hessienne, borne de Lipschitz et choix du pas.
- H. Stabilité flottante : `log1p`, softplus et tests extrêmes.
- I. Géométrie one-vs-rest, calibration et comparaison à softmax.
- J. Traces numériques, figures supplémentaires et protocole de reproduction.

La **recette stable** doit rester dans le tronc commun ; seule sa démonstration va en annexe.

## Plan de remise à niveau

### Phase 1 — assainissement scientifique

1. Geler toute diffusion du PDF actuel.
2. Écrire des tests qui reproduisent chaque chiffre, chaque tableau et chaque figure.
3. Corriger le pipeline train/validation/test et refaire tous les résultats.
4. Remplacer partout la perte directe par une perte stable réellement utilisée.
5. Réécrire entièrement les passages convexité/unicité/existence/convergence.
6. Corriger gradient, pas, arrêt, sous-dépassement, seuil et interprétation des coefficients.
7. Refaire la surface de coût à partir d'une trajectoire compatible.
8. Faire relire mathématiques, statistiques et code par deux personnes indépendantes.

### Phase 2 — reconstruction pédagogique

1. Définir trois niveaux : essentiel, pratique, approfondissement.
2. Couper au moins la moitié du tronc principal ou la déplacer en annexes.
3. Introduire les prérequis au moment où ils servent.
4. Ajouter des objectifs mesurables et un résumé opérationnel par chapitre.
5. Ajouter au minimum quatre devoirs et un laboratoire évalué.
6. Ajouter les corrigés détaillés en annexes.
7. Employer un second petit jeu de données pour vérifier le transfert des acquis.

### Phase 3 — publication

1. Produire un pipeline de construction en une commande.
2. Versionner le cours et fixer sa date au lieu de `\today`.
3. Relier chaque affirmation importante à une source.
4. Documenter provenance et licence des données.
5. Rendre le PDF balisé, déclarer sa langue et ajouter des alternatives aux figures.
6. Distinguer les classes par formes/motifs autant que par couleurs.
7. Tester impression, niveaux de gris, clavier et lecteur d'écran.
8. Remplacer l'auto-dépréciation par une note de méthode et de responsabilité éditoriale.

## Critères d'acceptation avant de reparler de « niveau MIT »

- [ ] Aucun résultat de test n'a influencé préparation, sélection ou réglage.
- [ ] Tous les exemples extrêmes (`z = ±1000`) passent sans exception ni infini.
- [ ] Les distinctions convexité / stricte convexité / existence / convergence sont exactes.
- [ ] Chaque figure est produite par le calcul qu'annonce sa légende.
- [ ] Tous les chiffres du PDF sont reconstruits par une commande automatisée.
- [ ] Le tronc commun peut être lu sans calcul différentiel avancé.
- [ ] Les preuves difficiles sont en annexes et reliées depuis le fil principal.
- [ ] Chaque chapitre possède objectifs, prérequis, exercices et corrigés.
- [ ] L'évaluation comprend baseline, incertitude, matrice de confusion et mesures par classe.
- [ ] Les sorties one-vs-rest ne sont pas vendues comme probabilités multiclasses calibrées.
- [ ] Le PDF est balisé et les figures ne dépendent pas de la couleur seule.
- [ ] Une relecture scientifique indépendante est documentée.

## Conclusion nette

Le document actuel n'est pas une « pisse de chameau » au sens graphique : il est beaucoup trop travaillé pour cela. Mais sa beauté masque des erreurs que des débutants ne peuvent pas détecter. C'est précisément ce qui le rend impropre à l'enseignement en l'état.

La base peut devenir excellente si l'on accepte une vraie reconstruction : **corriger d'abord, couper ensuite, mettre les preuves en annexes, puis ajouter de l'apprentissage actif**. Tant que ces quatre opérations ne sont pas faites, le présenter comme cours de référence serait indéfendable.
