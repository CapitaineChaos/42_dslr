# Contre-audit UX, éditorial et pédagogique

## Cours « Régression logistique »

Date : 1er août 2026  
Document examiné : source LaTeX, 17 fichiers de chapitre et PDF de 104 pages  
Objet : expérience de lecture, montage, architecture de l’information, progression, vocabulaire, français, registre, accessibilité, intérêt et qualité de présentation  
Hors périmètre : exactitude des mathématiques, du code et des résultats numériques, déjà examinée dans _RAPPORT_AUDIT.md_

---

## 0. Décision

**Décision éditoriale : refus de présentation ou de publication en l’état.**

Le document n’est pas au niveau d’un support académique que l’on pourrait raisonnablement présenter comme abouti au MIT, sur OpenCourseWare ou dans une formation universitaire exigeante. Ce jugement ne porte pas sur la justesse des formules. Même si chaque formule était exacte, la décision resterait la même.

Le défaut principal n’est pas « un peu trop de texte » ni « quelques tournures maladroites ». Le document impose au lecteur le travail que l’édition aurait dû accomplir :

- retrouver lui-même le problème central, présenté trop tard ;
- distinguer l’essentiel de l’approfondissement alors que le gabarit leur donne le même poids ;
- reconnaître ce qui est nouveau parmi de nombreuses reformulations ;
- reconstruire une terminologie stable malgré les glissements de sens et de notation ;
- changer sans avertissement d’espace mental — données, paramètres, probabilités, itérations ;
- supporter une succession de démonstrations prémâchées, de légendes-paragraphes et d’encadrés qui répètent la conclusion ;
- deviner ce qu’il peut sauter, faute de parcours, de prérequis et d’objectifs ;
- apprendre sans jamais être réellement invité à répondre, essayer, comparer ou décider.

**Le texte est lisible caractère par caractère, mais il n’est pas cognitivement utilisable sur 104 pages.** Sa difficulté ne vient pas seulement du sujet. Elle vient du montage.

Le compromis adopté est particulièrement mauvais :

- il ralentit jusqu’au niveau scolaire des opérations algébriques élémentaires ;
- il accélère ensuite jusqu’à la géométrie vectorielle, la vraisemblance, la Hessienne, la convexité ou les cas de séparation sans véritable sas ;
- il traite ainsi le lecteur avancé comme un enfant, sans donner au véritable débutant l’échafaudage dont il aurait besoin.

Ce n’est donc pas un document à « polir ». C’est un matériau à remonter.

### Note indicative

Les notes ci-dessous servent à rendre le diagnostic comparable ; elles ne prétendent pas constituer une mesure scientifique.

| Axe | Note | Diagnostic |
|---|---:|---|
| Confort de lecture continue | 2/10 | fatigant, répétitif, nombreuses ruptures de rythme |
| Économie cognitive | 1/10 | le lecteur doit hiérarchiser, dédupliquer et recoller |
| Progression globale | 2/10 | trois traversées du même contenu, problème central tardif |
| Enchaînement local | 5/10 | souvent fluide à l’intérieur d’un paragraphe, mais trop guidé |
| Pertinence dans le parcours essentiel | 3/10 | beaucoup de matière valable, souvent placée au mauvais niveau ou au mauvais moment |
| Découpage et hiérarchie | 2/10 | catégories nombreuses, fonctions éditoriales mal distinguées |
| Vocabulaire et stabilité terminologique | 3/10 | termes courants surchargés, notations et référents mouvants |
| Niveau grammatical du français | 6/10 | phrases généralement correctes, quelques fautes et constructions cassées |
| Qualité éditoriale du français | 3/10 | monotonie, absolutifs, personnification, gloses scolaires |
| Respect du lecteur adulte | 3/10 | micro-guidage infantilisant et formulations parfois avilissantes |
| Accessibilité pédagogique débutant | 2/10 | abondance d’explications, absence de parcours et d’activités |
| Valeur pour lecteur avancé | 3/10 | matière réelle, mais enfouie et mal isolée |
| Intérêt et engagement | 1,5/10 | consommation passive, aucune tension intellectuelle authentique |
| Finition graphique locale | 6/10 | palette et typographie cohérentes |
| Design d’information global | 3/10 | surcharge, petites tailles, répétition visuelle, pages orphelines |
| Accessibilité numérique | 1/10 | PDF non balisé, sans langue ni alternatives textuelles |
| Annexes et parcours avancé | 1/10 | une seule annexe étroite ; avancé dispersé dans le corps |
| Aptitude à une diffusion académique | 1,5/10 | appareil pédagogique et éditorial insuffisant |

**Appréciation globale : environ 2,5/10.**

---

## 1. Périmètre, méthode et sens de « niveau MIT »

### 1.1 Ce rapport ne refait pas l’audit mathématique

Le rapport existant _RAPPORT_AUDIT.md_ traite déjà la validité scientifique et numérique. Le présent contre-audit examine autre chose :

- dans quel ordre le lecteur rencontre les idées ;
- combien d’éléments il doit maintenir en mémoire ;
- si la même idée revient avec une fonction pédagogique nouvelle ou si elle est seulement redite ;
- si les mots, symboles et catégories gardent un sens stable ;
- si le document traite correctement différents niveaux de lecteurs ;
- si la voix est adulte, précise et digne ;
- si la mise en page montre la hiérarchie réelle ;
- si le PDF est navigable et accessible ;
- si l’ensemble donne envie de poursuivre et permet de vérifier une acquisition.

### 1.2 Corpus examiné

L’analyse porte sur :

- 104 pages de PDF ;
- 16 chapitres principaux et une annexe ;
- 68 sections ;
- environ 25 680 mots ;
- 62 figures et 14 tableaux ;
- 58 encadrés sémantiques ;
- 21 blocs de code ou de console.

Cela représente **155 composants visuels structurés**, soit environ 1,5 par page, avant même de compter les 12 petits encadrés de type _relevé_. La densité ne serait pas un défaut si ces composants distribuaient des fonctions différentes. Très souvent, ils racontent plusieurs fois la même chose.

### 1.3 « Niveau MIT » n’est pas une norme formelle inventée ici

Il n’existe pas, dans ce rapport, de prétendu tampon universel « MIT-compatible ». La comparaison repose sur des pratiques publiques observables :

- la page d’orientation de [MIT OpenCourseWare](https://ocw.mit.edu/pages/get-started/) présente le syllabus, les matériaux d’enseignement et les activités d’apprentissage comme des éléments ordinaires d’un cours ;
- l’unité de [MIT OpenCourseWare consacrée à la régression logistique dans _The Analytics Edge_](https://www.ocw.mit.edu/courses/15-071-the-analytics-edge-spring-2017/pages/logistic-regression/) alterne de courtes séquences, des _Quick Questions_, plusieurs cas d’usage adultes et un devoir ;
- les recommandations officielles de [MIT Digital Accessibility](https://accessibility.mit.edu/digital-accessibility/tools/accessibility-tips-for-content-creators/) demandent notamment une hiérarchie de titres, des alternatives textuelles, une information qui ne repose pas sur la couleur seule et, lorsque c’est possible, un format HTML plutôt qu’un PDF difficile d’accès.

Ce sont des points de comparaison concrets, pas un classement de prestige. Sur ces dimensions élémentaires — contrat de cours, activité, parcours, accessibilité — le document examiné est très loin du compte.

### 1.4 Limite concernant l’IA

Le texte déclare lui-même avoir été rédigé avec GPT et Claude (_regression_logistique.tex_, lignes 187–189). Cette déclaration est un fait. En revanche, aucun passage individuel ne peut être attribué honnêtement à une machine à partir du style seul, et ce rapport n’emploie aucun « détecteur d’IA ».

L’expression « soupe IA » désigne donc ici un ensemble de symptômes éditoriaux observables :

- cohérence locale élevée mais faible gain d’information ;
- transitions stéréotypées ;
- multiplication de reformulations qui n’ajoutent aucune tâche ;
- slogans d’inévitabilité ;
- personnification systématique ;
- oppositions binaires ou triades toutes faites ;
- conclusions annoncées, montrées, légendées puis encadrées ;
- ton uniformément assuré qui efface les différences entre définition, choix, intuition et résultat.

---

## 2. Diagnostic racine : le document n’a pas de genre stable

Le cours hésite entre cinq objets sans accomplir entièrement aucun d’eux.

| Genre possible | Ce qu’il faudrait | Ce que le document fait |
|---|---|---|
| Manuel | chapitres autonomes, exercices gradués, index, définitions stables | presque aucun exercice, pas d’index, dépendances fortes |
| Notes de cours | structure compacte, articulation avec séances et travaux | 104 pages de narration continue |
| Tutoriel | le lecteur agit, complète, exécute et obtient un retour | le code est livré et commenté ; le lecteur regarde |
| Référence | accès rapide, glossaire, notation stable, entrées indépendantes | notions répétées et sens mouvants |
| Vulgarisation | peu de prérequis, profondeur sélectionnée, récit resserré | dérivées, Hessienne, convexité et stabilité dans le même tunnel |

Cette indécision explique une grande partie du malaise. Le lecteur ne sait jamais s’il doit mémoriser, survoler, reproduire, démontrer ou simplement admirer une illustration.

### Conséquence

Le document doit devenir un ensemble de ressources distinctes :

1. un tronc commun court et orienté vers une compréhension opératoire ;
2. un cahier pratique réellement actif ;
3. des annexes avancées autonomes ;
4. une référence de notation et de vocabulaire ;
5. idéalement une version HTML accessible reliée au PDF imprimable.

---

## 3. Le contrat avec le lecteur est absent

### 3.1 Aucun public réel n’est choisi

Trois publics sont superposés :

- le débutant qui a besoin de rappels sur l’exponentielle, le logarithme, les vecteurs, les dérivées et Python ;
- l’étudiant intermédiaire qui veut comprendre puis implémenter ;
- le lecteur avancé qui veut la dérivation, les hypothèses et les cas limites.

Ils parcourent pourtant les mêmes 104 pages, dans le même ordre et avec les mêmes blocs graphiques.

L’accessibilité « à tous » ne consiste pas à expliquer chaque multiplication à tout le monde. Elle consiste à rendre visibles :

- les prérequis ;
- le résultat attendu ;
- le niveau du passage ;
- ce qui est essentiel ;
- ce qui est optionnel ;
- le rappel disponible en cas de besoin ;
- la manière de vérifier que l’on a compris.

Rien de cela n’est systématiquement fourni.

### 3.2 Les 17 ouvertures de chapitre sont des bandes-annonces, pas des objectifs

Chaque fichier commence par un encadré _lecture_. La forme est cohérente, mais le contenu suit presque toujours la même recette :

1. rappel de ce qui vient d’être raconté ;
2. difficulté mise en scène ;
3. solution promise ;
4. résultat déjà résumé.

Exemple : _p2_donnees.tex_, lignes 4–8, annonce quatre étapes « chacune vérifiable par un nombre connu d’avance ». Cela décrit la narration, pas une compétence.

Une véritable ouverture devrait tenir en cinq lignes :

- **Vous allez savoir** : deux ou trois verbes observables ;
- **Prérequis** ;
- **Durée** ;
- **Parcours** : essentiel / approfondissement ;
- **Test de sortie** : une question ou une tâche.

### 3.3 Aucune activité ne donne la main au lecteur

Le corpus ne contient pratiquement aucun exercice, quiz, problème à résoudre, correction graduée ou question à laquelle le lecteur doit répondre avant que la solution soit révélée.

Les questions du type « pourquoi ? » sont rhétoriques : la réponse suit immédiatement. Le lecteur n’a ni espace, ni délai, ni conséquence s’il ne répond pas.

Le résultat est paradoxal : le document explique énormément, mais enseigne peu de comportements intellectuels. Il ne fait presque jamais :

- prédire un résultat avant la figure ;
- choisir entre deux formulations ;
- identifier une erreur ;
- compléter une fonction ;
- comparer deux sorties ;
- expliquer un mécanisme avec ses propres mots ;
- transférer la méthode à un autre jeu de données.

---

## 4. La progression globale oblige à parcourir trois fois le même territoire

### 4.1 La première partie contient déjà l’intuition, la théorie et une partie des preuves

La partie « Voir » occupe environ 55 pages imprimées, 13 574 mots, 34 sections, 42 figures, 10 tableaux et 38 encadrés. Elle représente à elle seule environ 61 % de la prose.

Elle ne se limite pas à « voir ». Elle comprend :

- géométrie vectorielle ;
- généralisation aux hyperplans ;
- calculs de coût ;
- dérivée et gradient ;
- surfaces dans l’espace des paramètres ;
- choix du pas et critères d’arrêt ;
- géométrie multiclasses ;
- sauvegarde du modèle.

Le nom de partie induit donc une fausse promesse d’intuition légère.

### 4.2 La deuxième partie rediffuse au lieu de construire

« Construire » reprend le score, la sigmoïde, le coût, le gradient, la boucle, le multiclasses et l’évaluation dans neuf fichiers successifs. Le lecteur recommence le même parcours sous forme de code après plus de cinquante pages.

Le dispositif reste passif :

- chaque fichier importe le précédent ;
- chaque fonction est déjà donnée ;
- chaque résultat est immédiatement commenté ;
- aucune lacune intentionnelle ni test à écrire n’oblige à comprendre.

La séquence est même localement circulaire : à l’étape 1, les notes « arrivent déjà standardisées », alors que leur préparation n’est traitée qu’à l’étape 4 (_p2_donnees.tex_, lignes 61–65 puis 159–176).

Le code n’est donc pas un second mode d’apprentissage ; c’est une seconde narration.

### 4.3 La troisième partie recommence une troisième fois

« Démontrer » reprend successivement logit, sigmoïde, coût, gradient, convexité et stabilité. Cette partie pourrait former un bon dossier avancé, mais elle est présentée comme la troisième étape du même parcours et réexplique des objets déjà longuement installés.

Une reprise n’est utile que si la tâche change :

> reconnaître → appliquer → expliquer → démontrer → transférer.

Ici, le document n’annonce presque jamais :

- ce qui est considéré comme acquis ;
- ce qui est réellement nouveau ;
- qui peut sauter le passage ;
- où la preuve sera utilisée.

### 4.4 Cartographie des répétitions principales

| Objet | Première traversée | Deuxième traversée | Troisième traversée | Effet |
|---|---|---|---|---|
| Standardisation | _p1_standardisation_, 38–127 | _p2_donnees_, 159–176 | rappel dans _p2_predire_, 199–203 | sensation de redémarrage |
| Sigmoïde / logit | _p1_nuage_, 255–313 puis _p1_probabilite_, 10–85 | _p2_donnees_, 61–110 | _p3_logit_, 104–153 puis _p3_sigmoide_ | quatre expositions proches |
| Coût | _p1_erreur_, 11–155 | _p2_donnees_, 112–157 | presque tout _p3_cout_ | information déjà conclue avant preuve |
| Gradient | _p1_descente_, 10–58 | _p2_entrainer_, 15–79 | presque tout _p3_gradient_ | trois narrations d’une même chaîne |
| Un-contre-tous | _p1_modele_, 278–316 puis _p1_classifieur_, 11–121 | _p2_predire_, 14–83 | rappels ultérieurs | choix multiclasses étiré |
| Modèle sauvegardé | _p1_modele_, 97–177 | _p1_classifieur_, 264–321 | _p2_predire_, 187–203 | contenu du fichier expliqué trois fois |
| Valeur log 2 | _p1_erreur_, 145–155 | _p1_descente_, 62–83 | _p2_donnees_, 252–262 ; _p2_entrainer_, 94–118 ; _p3_cout_, 162–164 ; _p3_stabilite_, 151–153 | rituel de validation répété au moins six fois |

Le nombre 0,693 ou sa relation à log 2 apparaît dans 19 correspondances source. Le nombre 1 600 est répété des dizaines de fois. La continuité numérique peut aider ; ici elle devient un tic de réassurance.

### Règle de remédiation

Toute reprise conservée doit commencer par un cartouche de trois lignes :

> **Déjà acquis** : …  
> **Nouveau ici** : …  
> **Vous pouvez sauter si** : …

Sans nouvelle tâche cognitive, la reprise doit être supprimée ou remplacée par un renvoi.

---

## 5. Le problème central arrive trop tard

Le document ouvre sur les valeurs manquantes et la standardisation (_p1_standardisation.tex_, lignes 10–127). Le lecteur doit donc accepter :

- un fichier encore mal contextualisé ;
- le choix de deux variables ;
- une stratégie d’imputation ;
- une comparaison d’échelles ;
- une notation de cote standard ;

avant d’avoir vu une prédiction complète, une frontière imparfaite ou une question pédagogique claire.

L’« énoncé du problème » n’apparaît explicitement qu’à la fin du chapitre suivant, _p1_nuage.tex_, lignes 551–555.

Cette ouverture est une erreur UX. Elle fait payer le coût conceptuel avant de montrer la récompense.

### Ouverture recommandée en quatre pages

1. **La tâche** : une ligne d’entrée, une sortie attendue, un exemple d’erreur.
2. **Le résultat final imparfait** : une frontière, une prédiction et une mesure honnête.
3. **La chaîne complète** : données → préparation → score → probabilité → décision → évaluation.
4. **La carte du cours** : tronc commun, atelier, preuves, prérequis.

La préparation des données vient ensuite parce qu’un obstacle concret vient d’être observé.

---

## 6. Une granularité qui oscille entre école primaire et master

### 6.1 Micro-explication excessive

Dans _p3_sigmoide.tex_, lignes 17–35, la démonstration verbalise notamment :

- le changement de signe ;
- la mise au même dénominateur ;
- une multiplication par 1 ;
- une distribution.

Dans _p3_cout.tex_, lignes 20–26, le texte rappelle que a⁰ = 1 avant d’introduire quelques lignes plus loin indépendance conditionnelle et vraisemblance.

Les nombreuses sous-accolades commentent des termes déjà expliqués, puis persistent longtemps après l’acquisition attendue du vocabulaire.

### 6.2 Saut de niveau brutal

Quelques pages après ces gestes élémentaires, _p3_convexite.tex_, lignes 81–105, demande de suivre :

- des dérivées secondes ;
- une double somme ;
- une forme quadratique ;
- une conclusion de positivité dans une direction quelconque.

Le problème n’est pas que l’un soit trop simple ou l’autre trop avancé. Le problème est qu’ils appartiennent à deux rampes pédagogiques différentes et sont imposés dans le même flux.

### 6.3 Effet sur les publics

- Le lecteur intermédiaire se sent ralenti et pris de haut.
- Le débutant croit être accompagné, puis rencontre un mur conceptuel non préparé.
- Le lecteur avancé doit traverser des pages de gloses pour atteindre le contenu intéressant.

### Remédiation

Séparer trois niveaux visibles :

- **essentiel** : raisonnement conceptuel et usage ;
- **rappel de prérequis** : algèbre, logarithmes, vecteurs, dérivées ;
- **preuve avancée** : dérivation complète avec hypothèses et portée.

Le corps peut présenter une preuve en trois étapes conceptuelles. L’annexe de prérequis peut développer les transformations ligne à ligne pour ceux qui en ont réellement besoin.

---

## 7. Les espaces mentaux changent sans signalétique

Le chapitre sur la descente de gradient est le point culminant de la surcharge. Il demande au lecteur d’alterner entre :

1. **espace des données** : axes x₁ et x₂, élèves et frontière ;
2. **espace des probabilités** : surface au-dessus du plan des données ;
3. **espace des paramètres** : axes w₁, w₂ et surface du coût ;
4. **temps d’apprentissage** : courbes selon le numéro d’itération.

Ces représentations sont légitimes, mais elles sont montées comme une suite d’images du même récit. Le lecteur peut continuer à interpréter un axe comme une note alors qu’il représente désormais un coefficient.

Trois nappes de probabilité proches sont même distribuées sur trois pages successives. La comparaison exige de tourner les pages et de conserver la précédente en mémoire : c’est exactement le contraire d’une comparaison visuelle.

### Remédiation

Ajouter une signalétique persistante :

| Icône / bandeau | Espace | Question |
|---|---|---|
| D | données | Où se situe l’observation ? |
| P | paramètres | Comment varie le modèle ? |
| I | itérations | Que change l’entraînement dans le temps ? |
| R | résultat | Que prédit le modèle ? |

Une transition entre espaces doit être annoncée en une phrase et par un changement visuel. Les états comparés doivent être placés en petits multiples sur la même page.

---

## 8. Notations et vocabulaire : la mémoire du lecteur est inutilement taxée

### 8.1 Collisions de notation

- σ désigne d’abord l’écart-type (_p1_standardisation.tex_, lignes 111–124), puis la fonction sigmoïde (_p1_probabilite.tex_, lignes 28–34). Les deux coexistent ensuite.
- La cote standard, usuellement appelée _z-score_, est renommée x parce que z est réservé au score du modèle (_p1_standardisation.tex_, lignes 121–123). Le lecteur doit donc désapprendre une convention au moment où il découvre les objets.
- w exclut parfois le biais, puis J(w) semble contenir trois coefficients ; ailleurs la somme commence à j = 0.
- x désigne tantôt un point, tantôt le vecteur de caractéristiques, puis le code lui ajoute une première composante égale à 1 (_p2_donnees.tex_, lignes 73–76).

Chaque convention peut se défendre isolément. Leur superposition sans tableau canonique transforme la lecture en surveillance de symboles.

### 8.2 Termes surchargés

| Terme | Sens rencontrés |
|---|---|
| pente | pente d’une droite, dérivée, raideur de sigmoïde, inclinaison d’un terrain |
| erreur | mauvaise classe, résidu, écart, perte individuelle, coût moyen |
| coût | perte d’une observation, moyenne, surface globale |
| modèle | coefficients, règle de calcul, pipeline, fichier sauvegardé, ensemble de quatre classifieurs |
| probabilité | sortie binaire un-contre-tous, confiance affichée, quasi-distribution de classe |
| réponse | cible observée, « bonne réponse », sortie du programme, maison réelle |
| convergence | baisse du coût, stagnation, arrêt, stabilité des coefficients |

Un lecteur expert résout ces ambiguïtés. Un débutant les accumule.

### 8.3 Plusieurs états du modèle sont présentés comme s’il s’agissait du même

Les coefficients changent selon le point d’arrêt :

- état à 400 tours : environ (−4,745 ; −3,454 ; +3,469) ;
- classifieur ultérieur : environ (−4,997 ; −3,625 ; +3,655) ;
- tutoriel final : environ (−5,036 ; −3,651 ; +3,684).

Une explication partielle n’arrive que tardivement (_p2_entrainer.tex_, lignes 182–186). Avant cela, le lecteur doit décider seul si les écarts sont une erreur, un autre entraînement ou un autre modèle.

### Remédiation

Créer dès le début :

- une page de notation canonique ;
- un glossaire français–anglais ;
- des noms d’états : M₀ initial, M₄₀₀ démonstration, M\* tutoriel, M_OVR multiclasses ;
- une étiquette visible sur chaque figure et tableau numérique ;
- une règle « un référent, un terme ».

---

## 9. Où se situe précisément la « soupe IA »

### 9.1 Mécanisme général

Le schéma le plus fréquent est :

1. le corps annonce l’idée ;
2. une formule annotée la décompose ;
3. un diagramme la reformule ;
4. une légende raconte le diagramme ;
5. un tableau ou une console la chiffre ;
6. un encadré livre encore la conclusion.

Le lecteur reçoit six fois la réponse, mais n’a pas reçu de question à résoudre.

Ce n’est pas du double codage efficace. Dans un bon double codage, le texte et l’image ont des fonctions complémentaires. Ici, ils sont souvent deux narrateurs concurrents.

### 9.2 Zones les plus atteintes dans le PDF

Les symptômes sont particulièrement visibles aux pages PDF :

- 23–24 : chaîne, tableau, histogramme, matrice, équations et prose ;
- 35 : formules très annotées ;
- 47 : tableau, prose, avertissement, deux graphes et longue légende ;
- 53 : flux, chiffres, prose et conclusion ;
- 58–61 : panneaux multiples, géométrie multiclasses, listes et encadrés ;
- 67–71 : code, console, schémas et commentaires redondants ;
- 75–76 : code, histogramme, formule, console, échelle et avertissement ;
- 81 : échelle algébrique commentée ligne par ligne ;
- 88 et 92–100 : dérivations, gloses latérales, résultats et avertissements.

### 9.3 Formules rhétoriques répétées

Le corpus contient environ :

- 26 occurrences de « exactement » ;
- environ 75 formes de « seul » ;
- environ 88 formes de « tout » ;
- environ 64 « donc » ;
- une dizaine de « toujours » et plus d’une douzaine de « jamais ».

Ces mots ne sont pas fautifs. Leur concentration révèle toutefois une voix qui ferme constamment le raisonnement.

#### Patron A — fausse inévitabilité

- « le reste en découle » dans le résumé (_regression_logistique.tex_, lignes 171–175) ;
- « Tout l’algorithme tient dans ce signe moins » (_p1_descente.tex_, ligne 33) ;
- « et c’est la seule [hypothèse] que fait la régression logistique » (_p1_nuage.tex_, lignes 300–312) ;
- « C’est la règle du maximum, et elle seule » (_p1_classifieur.tex_, lignes 242–246).

Ces phrases sonnent bien isolément. Accumulées, elles produisent une certitude promotionnelle et masquent les conventions, hypothèses et limites.

#### Patron B — récit artificiel du choix

- « Deux voies s’ouvrent » ;
- « Deux candidates centrales se présentent » ;
- « la médiane l’emporte » (_p1_standardisation.tex_, lignes 45–55) ;
- « deux voies s’offrent » puis « la seconde est retenue » (_p1_classifieur.tex_, lignes 13–22).

Ce patron met en scène une décision déjà prise et donne l’illusion d’un raisonnement exploratoire sans demander au lecteur de comparer les options.

#### Patron C — personnification permanente

Le modèle « annonce », « voit », « juge » ; le coût « paie » ; l’erreur « meurt » ; la somme « se vide » ; la pente « entre » dans une moyenne ; le programme « sait juger ».

Une métaphore peut introduire une idée. Lorsque tout l’appareil mathématique devient un petit théâtre, les référents se brouillent et le registre perd en maturité.

#### Patron D — slogan de chaîne complète

Plusieurs conclusions déroulent :

> notes → frontière → score → probabilité → coût → dérivée → correction.

La version de _p1_modele.tex_, lignes 310–316, est claire. Mais cette chaîne réapparaît comme conclusion générique alors qu’elle devrait devenir un schéma de navigation unique, placé au début et enrichi progressivement.

#### Patron E — triplets et binarités automatiques

« Deux critères », « deux effets », « trois signes », « deux remèdes » apparaissent régulièrement avec une cadence très régulière. Le passage de l’annexe, lignes 130–143, en est un exemple net : trois signes conjoints puis deux remèdes, tous déjà interprétés pour le lecteur.

### 9.4 Hotspots textuels

| Emplacement | Symptôme | Pourquoi cela gêne |
|---|---|---|
| _regression_logistique.tex_, 160–175 | titre et résumé génériques, « le reste en découle » | promesse lisse, problème et public non précisés |
| _regression_logistique.tex_, 187–189 | « Le résultat n’est pas formidable mais il est lisible » | auto-dépréciation incompatible avec une présentation institutionnelle |
| _p1_standardisation.tex_, 45–55 | deux voies, deux candidates, la médiane l’emporte | dramaturgie artificielle |
| _p1_nuage.tex_, 280–313 | score qui « doit » devenir probabilité, hypothèse « seule » | choix de modèle présenté comme nécessité narrative |
| _p1_nuage.tex_, 431–464 | « rendre la frontière corrigeable », mesurer « de combien elle est mal placée » | anthropomorphisme imprécis |
| _p1_probabilite.tex_, 69–245 | prose, constantes, flux, tableau, contributions, signes, exemples | sept explications sans tâche nouvelle |
| _p1_erreur.tex_, 13–83 | modèle qui annonce, voit, se trompe, paie, hésite ; coût qui juge | récit infantilisant et référents humains problématiques |
| _p1_descente.tex_, 10–33 | terrain et descente ; slogan du signe moins | métaphore transformée en explication totale |
| _p1_descente.tex_, 109–154 | erreur qui meurt, somme qui se vide | animation verbale à faible précision |
| _p1_modele.tex_, 4–13 | « trois nombres » présentés comme modèle entier | contredit ensuite par le pipeline à sauvegarder |
| _p2_donnees.tex_, 107–110 | « une fonction […] est fausse, et tout ce qui la suit le sera » | sanction absolue, ton scolaire |
| _p2_donnees.tex_, 264–265 | « le programme sait maintenant juger » | personnification promotionnelle |
| _p3_logit.tex_, 94–102 | « Rien n’empêche plus », hypothèse unique, la suite ne ferait que dérouler | clôture prématurée et auto-commentaire |
| _p3_sigmoide.tex_, 17–35 | commentaire de chaque manipulation | micro-guidage avilissant pour un public universitaire |
| _p3_cout.tex_, 40–112 | vraisemblance reformulée par texte, figure, légende, calcul et justification | répétition multimodale sans progression |
| _p3_gradient.tex_ | « la dérivée entre », le facteur « sort » | narration anthropomorphe au milieu d’une preuve |
| _p3_convexite.tex_, 107–128 | conclusion absolue puis exceptions immédiates | architecture argumentative contradictoire |
| _p3_stabilite.tex_, 57–64 | « hors d’atteinte des arrondis » | rassurant mais imprécis |
| _annexe_norme.tex_, 17–22 | « La réponse commande un morceau du programme » | dramatisation générique |

### 9.5 Ce qui n’est pas de la soupe

Il faut éviter une purge aveugle. Sont utiles :

- la continuité d’un même exemple lorsqu’elle réduit réellement le coût de contexte ;
- une métaphore courte à la première exposition ;
- une figure qui permet une comparaison impossible dans le texte ;
- une répétition qui change la tâche ;
- une conclusion qui oblige d’abord le lecteur à produire la sienne.

Le critère n’est pas « phrase élégante = IA ». Le critère est : **combien d’information ou d’action nouvelle cette unité apporte-t-elle ?**

---

## 10. Ton, dignité et formulations avilissantes

### 10.1 Le cas le plus problématique : faire « coûter » les élèves

Le document parle régulièrement du :

- « coût d’un élève » ;
- « coût de l’élève le plus coûteux » ;
- nombre d’« élèves bien classés », « mal classés » ou « atypiques » ;
- « élèves appris » dans _p2_donnees.tex_, ligne 40.

Même avec des personnages fictifs, ce choix installe une mauvaise habitude : il fait du sujet humain l’objet déficient ou coûteux, alors que la quantité concerne **la prédiction du modèle pour une observation**.

Cela est à la fois avilissant, imprécis et pédagogiquement dangereux pour un transfert à des domaines réels.

### Remplacements obligatoires

| À proscrire | À écrire |
|---|---|
| coût d’un élève | perte associée à cette prédiction / observation |
| élève coûteux | observation dont la prédiction entraîne une forte perte |
| élève mal classé | prédiction incorrecte pour cette observation |
| élève atypique | observation atypique au regard des variables utilisées |
| élèves appris | observations d’entraînement |
| maison réelle / bonne réponse | classe observée / étiquette de référence |
| le modèle voit juste | la classe prédite correspond à la classe observée |
| le programme juge | la fonction évalue la valeur du critère |

### 10.2 L’univers Harry Potter

Le jeu de données peut rester un cas filé. Il apporte une continuité et évite de prétendre traiter des conséquences réelles. Mais il doit être utilisé comme un **jeu de labels**, pas comme une histoire racontée à des enfants.

À conserver :

- une table de quelques observations ;
- les quatre classes ;
- une figure de séparation ;
- un exemple de prédiction.

À réduire :

- « Gryff ou non » répété comme refrain ;
- les maisons personnifiées ;
- les couleurs de maison comme unique code ;
- le vocabulaire scolaire appliqué aux personnes.

### 10.3 Respect du lecteur

Traiter le lecteur en adulte signifie :

- ne pas commenter une multiplication par 1 sauf dans un rappel optionnel ;
- ne pas préannoncer toutes les conclusions ;
- laisser une vraie question ouverte pendant quelques lignes ;
- distinguer une intuition d’un énoncé précis ;
- admettre qu’un choix est un choix ;
- offrir un chemin court et un approfondissement, plutôt qu’un tunnel unique.

---

## 11. Niveau de français

### 11.1 Diagnostic nuancé

Le français n’est pas « mauvais » au sens scolaire. La majorité des phrases est grammaticalement construite, le vocabulaire est relativement sobre et la typographie générale est soignée.

Le problème est éditorial :

- densité excessive de relations logiques dans certaines phrases ;
- fréquence des tournures impersonnelles ;
- registre qui passe du scolaire au technique sans transition ;
- substantifs dont le référent change ;
- propositions absolues ;
- rythme répétitif des conclusions ;
- légendes qui deviennent un second corps de texte ;
- fragments et quelques erreurs visibles.

On peut donc évaluer séparément :

| Dimension | Note indicative |
|---|---:|
| Orthographe et grammaire de surface | 6/10 |
| Clarté syntaxique sur une phrase | 6/10 |
| Précision terminologique | 3/10 |
| Cohérence de registre | 3/10 |
| Agrément sur une lecture longue | 2/10 |
| Respect du niveau universitaire | 3/10 |

### 11.2 Corrections ponctuelles repérées

Cette liste n’est pas une correction exhaustive, mais montre qu’une passe professionnelle reste nécessaire :

- _p1_descente.tex_, vers 300–303 : « 0,996. tandis que » commence une nouvelle phrase par une minuscule ;
- _p1_descente.tex_, lignes 194 et 267 : « quatre centième » doit être harmonisé avec « quatre-centième » ;
- _p1_descente.tex_, vers 486 : « Deux critères, employés ensemble. » est un fragment ;
- _p1_modele.tex_, vers 20 : « Herbology est négatif » attribue le signe à la matière plutôt qu’au coefficient associé ;
- _p1_classifieur.tex_, ligne 133 : « le deuxième score » est ambigu ; écrire « le deuxième score le plus élevé » ;
- _p2_donnees.tex_, ligne 40 : « exactitude hors des élèves appris » est non idiomatique ;
- _p2_entrainer.tex_, lignes 11–13 : construction syntaxique cassée ;
- _p2_entrainer.tex_, vers 188–190 : phrase nominale ou construction incomplète ;
- _p2_predire.tex_, vers 10 : interrogation ponctuée comme une affirmation ;
- _p3_logit.tex_, vers 135 : même égalité recopiée deux fois ;
- sorties de console en anglais dans un cours français : choix non annoncé et non harmonisé.

### 11.3 Passages à réécrire pour densité

Les zones suivantes demandent une réduction et une segmentation, même lorsqu’elles sont grammaticalement correctes :

- _p1_standardisation.tex_, 88–94 ;
- _p1_nuage.tex_, 137–156 et 467–481 ;
- _p1_probabilite.tex_, 190–195 ;
- _p1_descente.tex_, 318–332 ;
- _p1_classifieur.tex_, 191–203 ;
- _p2_donnees.tex_, 88–105 ;
- _p2_entrainer.tex_, 70–73 ;
- _p3_convexite.tex_, 81–105.

### 11.4 Charte de réécriture

1. Une phrase porte une relation principale.
2. Un paragraphe répond à une question.
3. Une section introduit un seul concept central.
4. La première occurrence peut employer une métaphore ; les suivantes emploient le terme précis.
5. Les mots « seul », « tout », « jamais », « toujours » et « exactement » exigent une justification ou sont supprimés.
6. Chaque assertion est marquée comme définition, hypothèse, choix du cours, observation du jeu de données ou résultat général.
7. Une légende identifie et donne une seule clé de lecture ; l’analyse reste dans le corps.
8. Une conclusion n’est pas répétée dans le paragraphe, la légende et l’encadré.

---

## 12. Audit du PDF : propre localement, mal monté globalement

### 12.1 Verdict visuel

La microtypographie du corps est correcte. La police Libertinus, le corps voisin de 12 points, la palette restreinte, les polices embarquées et les signets de chapitres constituent une base sérieuse.

Mais le PDF paraît **accumulé puis coulé dans un gabarit**, pas édité page par page.

### 12.2 Densité et légendes

Sur 76 légendes :

- 42 atteignent au moins environ 40 mots ;
- 32 atteignent au moins environ 50 mots ;
- 7 dépassent environ 70 mots ;
- la plus longue approche 99 mots.

Une légende de cette taille n’est plus une légende. Elle devient une narration concurrente, souvent redondante avec le texte situé juste avant ou après.

### 12.3 Tailles de texte

| Élément | Taille observée approximative | Diagnostic |
|---|---:|---|
| Corps | 12 pt | bon |
| Légendes | 10,8–10,9 pt | acceptable |
| Code monospace | 8,47 pt | trop petit pour un support imprimé |
| Nombreux labels | 6,77–7,97 pt | trop petit |
| Labels essentiels, page PDF 16 | 4,98–5,98 pt | bloquant |

Le code tient parce qu’il est rapetissé. Une figure qui n’entre qu’avec du texte à 5 points ne doit pas être réduite : elle doit être scindée.

### 12.4 Rythme de pages

Le montage alterne compression et vide accidentel.

Pages particulièrement denses : PDF 9, 19, 24, 30, 32, 35 et 76.  
Pages accidentellement sous-remplies : PDF 38, 48, 72, 77, 83 et 90.  
Pages de partie très légères mais sans fonction : PDF 7, 62 et 78.

Les pages PDF 48, 72, 77 et 83 ne contiennent pratiquement qu’un encadré terminal en haut, laissant environ 80 à 90 % de vide. Ce n’est pas une respiration choisie ; c’est un défaut de pagination.

### 12.5 Parcours visuel page par page

| Pages PDF | Diagnostic |
|---|---|
| 1–2 | couverture propre mais austère ; aucune institution, version ni édition ; résumé sous-rempli ; auteur absent des métadonnées |
| 3–6 | sommaire lisible mais dense ; annexe non regroupée ; références absentes |
| 7 | page de partie sans carte, objectifs ni prérequis |
| 8–11 | grille cohérente ; surcharge déjà nette page 9 |
| 12–20 | accumulation de graphes, géométrie, tableaux et équations annotées ; labels proches de 5 pt page 16 |
| 21–27 | chaîne de calcul, tableau, histogramme, matrice, équations et prose ; répétitions visibles |
| 28–33 | figures, relevés et encadrés en concurrence ; rythme très irrégulier |
| 34–48 | pire zone de montage ; trois nappes sur trois pages, surfaces séparées, pages orphelines |
| 49–54 | schémas, valeurs et flux combinés ; labels proches de 6 pt |
| 55–61 | noyau de soupe visuelle : multipanneaux, équations, listes et avertissements |
| 62 | nouvelle page de partie sans orientation |
| 63–67 | bonne idée de carte des fichiers, mais noms autour de 6,77 pt ; code petit ; vérification répétée |
| 68–72 | diagramme, console, texte et avertissement ; fin sur encadré isolé |
| 73–77 | code, histogramme, formule, console et échelle ; nouveau bloc isolé à la fin |
| 78 | troisième page de partie sous-employée |
| 79–83 | longue échelle algébrique commentée ; lecture en zigzag ; pages quasi vides |
| 84–86 | plus calme, mais opérations élémentaires toujours visuellement dominantes |
| 87–90 | avertissement, chaîne graphique, légende et dérivation ; puis page aux deux tiers vide |
| 91–94 | calculs et gloses latérales concurrents : _split attention_ |
| 95–97 | cohérent mais trop chargé ; encadré et conclusion font une seconde narration |
| 98–100 | longues dérivations, nouveau titre en bas de page, figure, tableau et avertissement |
| 101–103 | annexe dense sans identité « avancée » |
| 104 | références lisibles, sous-remplies et mal intégrées à la navigation |

### 12.6 Figures hors grille

- Trois nappes de _p1_descente.tex_, autour des lignes 201–228, sont placées à 1,28 fois la largeur du texte.
- Une figure de _p1_classifieur.tex_, ligne 183, atteint 1,18 fois la largeur.
- Une autre, vers la ligne 254, atteint 1,20 fois la largeur.
- D’autres dépassements sont présents autour de 1,12 fois la largeur.

Ces choix réduisent les marges physiques et signalent que le contenu n’a pas été conçu pour la page.

### 12.7 Comparaisons impossibles

Les trois nappes des pages PDF 39–41 doivent être vues simultanément, mais sont distribuées sur trois pages. De même, surface de coût et courbes de niveau sont séparées.

Remplacer par :

- un seul petit multiple avec axes identiques ;
- idéalement une vue 2D commune ;
- la 3D en annexe ou dans un support interactif ;
- une phrase de comparaison qui ne répète pas la légende.

### 12.8 Couleurs et contrastes

Points positifs :

- corps sombre sur blanc : contraste fort ;
- accent bleu-vert et orange d’avertissement : contrastes généralement suffisants ;
- titres blancs sur bande sombre : lisibles.

Défauts :

- certains petits titres gris avoisinent un contraste de 3,72:1 ;
- des axes très pâles sont proches de 2,15:1 ;
- des régions remplies à 7 % disparaissent presque en niveaux de gris ;
- plusieurs courbes et maisons sont distinguées surtout par la teinte ;
- mêmes couleurs utilisées à la fois comme catégories de maison et comme fonctions sémantiques d’encadré.

La couleur doit renforcer le sens, pas le porter seule. Ajouter :

- traits pleins, tirets et pointillés ;
- marqueurs de formes différentes ;
- hachures ;
- étiquettes directes ;
- test systématique en niveaux de gris et pour plusieurs déficiences de vision des couleurs.

### 12.9 Navigation

Points positifs :

- signets complets pour parties, chapitres et sections ;
- panneau de signets ouvert ;
- table des matières cliquable ;
- texte extractible ;
- polices incorporées.

Défauts :

- aucun en-tête courant : sur une page de figure, partie et chapitre disparaissent ;
- liens internes noirs sans affordance ;
- résumé, sommaire et références sans signets propres ;
- références absentes de la table des matières ;
- annexe non séparée graphiquement de la partie III ;
- labels de page incohérents : doublons « i » et « 1 » ;
- sections parfois lancées dans le dernier tiers d’une page pour deux ou trois lignes.

---

## 13. Accessibilité : abondance d’explication ne signifie pas accessibilité

### 13.1 Accessibilité numérique

Le PDF est :

- non balisé (_Tagged: no_) ;
- sans structure logique accessible ;
- sans langue déclarée (_fr-FR_) ;
- sans alternatives textuelles pour les figures ;
- sans descriptions longues pour les schémas complexes ;
- avec un ordre d’extraction incohérent dans certains diagrammes ;
- avec quelques équations mal extraites ;
- fortement dépendant de la couleur dans plusieurs figures.

Pour un document prétendant être accessible « à tous », ces points sont bloquants.

### 13.2 Accessibilité cognitive

Les obstacles principaux sont :

- absence de carte et de parcours ;
- absence de prérequis ;
- absence de glossaire ;
- symboles surchargés ;
- longues légendes ;
- phrases et figures qui se répètent ;
- niveaux mélangés ;
- aucune activité de récupération ;
- aucune indication de ce qui peut être sauté ;
- comparaison de figures séparées ;
- changements d’espace non signalés.

### 13.3 Accessibilité pédagogique par niveaux

Le document devrait proposer quatre portes :

1. **Vue d’ensemble** : 4 pages, sans preuve.
2. **Essentiel** : 35 à 45 pages, pour comprendre et utiliser.
3. **Atelier pratique** : code et tests.
4. **Approfondissements** : annexes autonomes.

Un débutant peut alors ouvrir les rappels. Un lecteur avancé peut aller directement aux preuves. L’étudiant intermédiaire n’est plus pris en otage par les deux extrêmes.

### 13.4 Formats à produire

- PDF balisé, avec langue, titres, ordre de lecture et textes alternatifs ;
- HTML sémantique, équations en MathML ;
- code copiable et téléchargeable ;
- images avec résumé court et description longue ;
- version imprimable contrôlée ;
- vérification au clavier et avec lecteur d’écran.

---

## 14. Intérêt, plaisir de lecture et engagement

### 14.1 Ce qui pourrait susciter l’intérêt

Le document possède de vrais atouts :

- un jeu de données continu ;
- un résultat visible ;
- des figures fabriquées pour le cours ;
- une chaîne complète allant des données au modèle ;
- une motivation correcte du _gradient check_ ;
- des questions de stabilité numérique concrètes ;
- une tentative de relier géométrie, code et calcul.

### 14.2 Pourquoi l’intérêt retombe

L’intérêt suppose au moins l’un de ces mécanismes :

- une question dont on ignore encore la réponse ;
- une décision à prendre ;
- une surprise ;
- une erreur à diagnostiquer ;
- une progression visible ;
- un transfert vers un nouveau cas.

Le cours désamorce presque toujours ces mécanismes :

- la conclusion est donnée dès l’ouverture ;
- la figure confirme ce que le texte vient de dire ;
- la légende explique ce qu’il faut voir ;
- l’encadré dit ce qu’il faut retenir ;
- le chapitre suivant recommence.

Le lecteur n’est pas intrigué ; il est escorté.

### 14.3 Cas d’usage trop unique

Le même univers assure la cohérence, mais finit par créer une bulle fermée. Un support de niveau universitaire devrait montrer la portée sans multiplier les chapitres :

- un second micro-cas adulte de cinq lignes ;
- un cas où l’erreur de classification a un coût différent ;
- une question de transfert : « que faudrait-il changer ? » ;
- une limite éthique ou méthodologique.

Il ne s’agit pas d’ajouter de la matière. Il s’agit de faire sortir la notion de son décor.

---

## 15. Audit chapitre par chapitre

La colonne « décision » indique le sort éditorial recommandé, indépendamment de la vérité mathématique.

| Chapitre | Diagnostic UX | Décision |
|---|---|---|
| 1. Notes brutes et standardisation | commence par l’intendance avant le problème ; mêle valeurs absentes et changement d’échelle ; justification longue avant motivation | déplacer après la vue d’ensemble ; scinder les deux opérations ; garder un tableau et une activité |
| 2. Nuage de points et frontière | contient au moins six mini-chapitres : nuage, géométrie vectorielle, variation des coefficients, score/logit, cible, exigences, hyperplans ; l’énoncé arrive à la fin | garder nuage, score et frontière ; déplacer géométrie vectorielle et hyperplans en annexe |
| 3. Probabilité d’appartenance | réexplique le logit et la sigmoïde malgré la promesse de ne pas démontrer ; utilise des coefficients finaux avant l’entraînement ; sept formes pour le même pipeline | garder une courbe, un calcul et un schéma ; déplacer le seuil après l’évaluation |
| 4. Coût, mesure de l’erreur | passage individuel → moyenne globalement clair ; concentration du coût et coût selon erreurs deviennent des tangentes | garder une seule visualisation de perte ; déplacer l’analyse des observations atypiques |
| 5. Descente de gradient | chapitre le plus surchargé : formule, itérations, trois nappes, surface, contours, norme, largeur, pas, arrêt | éclater en « un pas », « boucle », « diagnostic avancé » ; trois figures maximum dans le tronc |
| 6. Modèle obtenu | « trois nombres » d’abord présentés comme modèle complet, puis pipeline et statistiques ajoutés ; état du modèle ambigu | garder artefact, une prédiction et une limite ; supprimer les coefficients répétés |
| 7. Classification à quatre maisons | noyau OVR utile, puis géométrie des régions trop longue ; sauvegarde répétée | garder OVR, argmax, exemple et limite ; déplacer les régions en annexe ; fusionner la sérialisation |
| 8. Écriture du score et du coût | neuf fichiers en chaîne ; étape 1 suppose la préparation de l’étape 4 ; stabilité numérique arrive avant certains enjeux ; code passif | réordonner chargement → préparation → score → sigmoïde stable → perte ; transformer en tâches à compléter |
| 9. Recherche de meilleurs coefficients | motivation du _gradient check_ réussie ; tangentielle sur l’erreur en h² ; répétition du premier pas et de la boucle | garder le contrôle du gradient ; marquer l’analyse numérique avancée ; supprimer la redite de la partie I |
| 10. Quatre maisons et exactitude | mélange multiclasses, hasard, évaluation, fichier de modèle et conclusion ; tangente RNG | scinder « multiclasses » et « évaluation » ; montrer réellement matrice de confusion et protocole |
| 11. Construction de la fonction logistique | troisième exposition de la sigmoïde ; formule « tout ce qui suit ne fait que… » | convertir en annexe de preuve ; commencer par « déjà acquis / nouveau » |
| 12. Propriétés de la fonction logistique | commente des opérations élémentaires juste avant des notions plus avancées | preuve conceptuelle courte ; détail algébrique dans un rappel de prérequis |
| 13. Construction du coût par vraisemblance | répète le chapitre 4 par texte, figure, légende, calcul et justification | séparer rappel essentiel et preuve probabiliste avancée ; supprimer les doubles |
| 14. Calcul du gradient | architecture la plus défendable de la partie III ; reste redondante avec les parties précédentes | conserver comme annexe autonome avec prérequis et notation propre |
| 15. Unicité du minimum | saut brutal vers Hessienne ; titre et résultat promettent une unicité avant d’introduire les exceptions | annexe avancée ; annoncer les conditions avant la conclusion |
| 16. Réécritures pour la stabilité numérique | contenu utile mais placé après le code qui en a besoin ; dérivation longue dans le flux | placer la recette stable et ses tests dans l’atelier ; preuve en annexe |
| Annexe. Croissance de la norme | annexe unique, niche, répétitive avec descente et convexité ; pas de statut visuel avancé | intégrer dans un dossier « optimisation avancée » ; ne pas en faire l’unique annexe |

### 15.1 Diagnostic spécifique du chapitre 5

_p1_descente.tex_ cumule :

- 8 sections ;
- 12 figures ;
- environ 3 000 mots ;
- plusieurs espaces de représentation ;
- quatre figures dépassant ou approchant la largeur de composition ;
- des pages de comparaison séparées ;
- de longues légendes ;
- des résultats intermédiaires et des conclusions encadrées.

C’est le principal tunnel cognitif du document. Il doit être démonté, pas simplement raccourci.

### 15.2 Diagnostic spécifique des parties 2 et 3

La partie 2 devrait être le lieu de l’action, mais elle livre le parcours.  
La partie 3 devrait être le lieu de la profondeur, mais elle réenseigne l’élémentaire.

Ces deux erreurs de fonction expliquent pourquoi la longueur ne produit pas la sensation d’un cours complet, mais celle d’un texte qui ne sait pas quand s’arrêter.

---

## 16. Ce qu’il faut garder, déplacer, fusionner ou supprimer

### 16.1 À garder dans le tronc commun

- un exemple continu sur quelques observations ;
- une figure du nuage et de la frontière ;
- un schéma unique de la chaîne de prédiction, placé très tôt ;
- un calcul complet score → probabilité → décision ;
- une visualisation de la perte ;
- un pas d’apprentissage ;
- une courbe d’évolution ;
- le principe un-contre-tous et l’argmax ;
- le contenu explicite de l’artefact sauvegardé ;
- une véritable évaluation sur données séparées ;
- une courte section sur les limites.

Parmi les éléments actuels particulièrement récupérables :

- le diagramme de pipeline de _p1_probabilite.tex_, autour des lignes 106–130 ;
- l’explication conceptuelle du seuil, autour de 265–271, à déplacer ;
- la motivation du contrôle du gradient, _p2_entrainer.tex_, 23–34 ;
- la liste du contenu du classifieur, _p1_classifieur.tex_, 305–320 ;
- l’ouverture du problème de stabilité, _p3_stabilite.tex_, 14–19.

### 16.2 À déplacer vers les annexes

- produit scalaire, norme, distances et hyperplans ;
- géométrie détaillée des régions multiclasses ;
- toutes les surfaces 3D ;
- étude de la raideur et de la norme ;
- dérivations complètes du logit, de la sigmoïde, de la perte et du gradient ;
- Hessienne, convexité, directions nulles, séparabilité et régularisation ;
- analyse d’erreur de la différence finie ;
- stabilité numérique démontrée ;
- discussion détaillée du générateur aléatoire.

### 16.3 À fusionner

- les multiples courbes de sigmoïde ;
- les tableaux et figures qui donnent les mêmes probabilités ;
- les validations répétées par log 2 ;
- les explications du premier pas sur le biais ;
- les trois descriptions du fichier de modèle ;
- les trois introductions à l’un-contre-tous ;
- les trois nappes successives en un petit multiple ;
- texte et légende lorsqu’ils interprètent la même figure.

### 16.4 À supprimer

- l’auto-dépréciation du résumé ;
- les slogans de totalité ou d’inévitabilité ;
- les commentaires de micro-opérations dans le tronc commun ;
- les conclusions encadrées qui recopient le paragraphe précédent ;
- les figures décoratives ne portant aucune comparaison ;
- les pages orphelines ;
- le vocabulaire qui attribue une « faute » ou un « coût » à une personne ;
- les reprises numériques sans nouvelle question ;
- les phrases de transition générées comme « il reste à », « rien n’empêche plus », « tout ce qui suit » lorsqu’elles ne donnent aucune information.

---

## 17. Architecture de remplacement

### 17.1 Tronc commun : 35 à 45 pages

| Module | Fonction | Volume cible |
|---|---|---:|
| 0. Mode d’emploi | public, prérequis, objectifs, parcours, notation | 2 pages |
| 1. Le problème complet | entrée, sortie, exemple, mesure, limites | 3–4 pages |
| 2. Du nuage au score | cible, frontière, score | 4–5 pages |
| 3. Préparer les données | absence, échelle, séparation entraînement/test | 4 pages |
| 4. Du score à la décision | sigmoïde, probabilité, seuil | 4–5 pages |
| 5. Mesurer une prédiction | perte et évaluation intuitive | 4 pages |
| 6. Apprendre | un pas, gradient, boucle, arrêt | 5 pages |
| 7. Implémenter sans casser | fonctions stables, contrôles, tests | 5–6 pages |
| 8. Évaluer honnêtement | holdout, matrice de confusion, lecture des erreurs | 4–5 pages |
| 9. Passer à plusieurs classes | OVR, argmax, limites | 3–4 pages |
| 10. Sauvegarder, réutiliser, transférer | artefact, prédiction, limites, suite | 3–4 pages |

Chaque module comporte :

- une question initiale ;
- une idée essentielle ;
- un exemple résolu ;
- un exemple partiellement résolu ;
- une tâche pour le lecteur ;
- une synthèse de trois lignes ;
- un renvoi vers les annexes.

### 17.2 Cahier pratique séparé

Le cahier pratique reprend les neuf fonctions, mais sous une forme active :

1. test fourni, fonction incomplète ;
2. indices gradués ;
3. sortie attendue ;
4. explication de l’échec ;
5. solution repliable ou séparée ;
6. défi de transfert.

Le lecteur construit un programme ; il ne regarde plus l’auteur le construire.

### 17.3 Annexes avancées

| Annexe | Contenu |
|---|---|
| A | notation canonique et glossaire français–anglais |
| B | moyenne, médiane, écart-type, exponentielle et logarithme |
| C | vecteurs, produit scalaire, norme, droite et hyperplan |
| D | dérivée, dérivée partielle, règle de chaîne, gradient |
| E | vraisemblance, log-vraisemblance et perte |
| F | preuves sur logit, sigmoïde et gradient |
| G | convexité, identifiabilité, séparation et régularisation |
| H | stabilité numérique et formes protégées |
| I | un-contre-tous, softmax, calibration et géométrie multiclasses |
| J | tests, corrections du cahier et reproductibilité |

Une annexe avancée doit être autonome :

- objectif ;
- prérequis ;
- notation ;
- résultat utilisé dans le corps ;
- preuve ;
- limites ;
- renvoi de retour.

### 17.4 Carte de navigation

Le schéma de la chaîne complète doit exister une seule fois comme carte persistante :

> données → préparation → score → probabilité → décision → évaluation  
>                         ↑ apprentissage ← perte

Chaque chapitre colore uniquement l’étape active. Le schéma devient navigation, pas conclusion répétée.

---

## 18. Nouveau système éditorial

### 18.1 Quatre types de blocs maximum

Le document actuel multiplie _lecture_, _résultat_, _vigilance_, _chiffres_, _relevé_ et _rappel_, auxquels s’ajoutent figures, tableaux, code et consoles.

Limiter à :

1. **Essentiel** : indispensable au parcours ;
2. **Exemple** : application concrète ;
3. **Attention** : erreur ou limite ;
4. **Approfondissement** : sortie vers l’annexe.

Les nombres restent dans un tableau ou le corps. Les _relevés_ ne méritent pas une catégorie visuelle autonome.

### 18.2 Hiérarchie typographique

- corps au moins 11,5–12 pt ;
- code au moins 9,5–10 pt ;
- labels de figure au moins 8,5–9 pt ;
- aucune information essentielle sous 8,5 pt ;
- largeur des figures limitée à la grille ;
- extraits de code avec nom de fichier et numéros de lignes ;
- en-têtes courants partie / chapitre ;
- titres de niveau cohérents ;
- pages de partie utilisées comme cartes de parcours ou supprimées dans la version écran.

### 18.3 Budget visuel

Pour le tronc commun :

- 18 à 24 figures maximum ;
- une fonction cognitive principale par figure ;
- une composante dominante par page ou double page ;
- légendes de 20 à 35 mots dans la majorité des cas ;
- une comparaison sur une même page ;
- aucune figure 3D si une projection 2D répond mieux à la question ;
- code long renvoyé au cahier ou au dépôt.

### 18.4 Règle anti-soupe

Pour chaque paragraphe, encadré, figure ou tableau, poser quatre questions :

1. Quelle question résout-il ?
2. Quelle information nouvelle apporte-t-il ?
3. Quelle action demande-t-il au lecteur ?
4. Que perd-on si on le supprime ?

Si les réponses sont « la même que juste avant », « aucune », « aucune » et « rien », l’élément doit disparaître.

---

## 19. Stratégie de remédiation

### P0 — avant toute nouvelle présentation

1. Décider du public principal : étudiant ayant des bases d’algèbre, de fonctions et de Python.
2. Écrire le contrat pédagogique et la carte du cours.
3. Réduire le tronc commun à 35–45 pages.
4. Déplacer les preuves et la géométrie avancée en annexes autonomes.
5. Supprimer ou fusionner environ la moitié des figures explicatives.
6. Réduire les légendes à une identification et une clé de lecture.
7. Reconstruire entièrement les tunnels PDF 34–48, 55–61, 63–77 et 79–100.
8. Remplacer les trois nappes successives par une comparaison simultanée.
9. Stabiliser notation, lexique et noms des états de modèle.
10. Éliminer toutes les formulations attribuant un coût ou une défaillance à l’élève.
11. Transformer le tutoriel en activité.
12. Produire un PDF balisé et une version HTML accessible.

### P1 — qualité académique

13. Ajouter objectifs, prérequis, durée et test de sortie à chaque module.
14. Introduire des exercices gradués et corrigés.
15. Ajouter un glossaire et un index.
16. Déclarer définition, hypothèse, choix du cours, observation et résultat.
17. Ajouter une vraie section d’évaluation et une matrice de confusion.
18. Harmoniser français, terminologie et sorties de console.
19. Refaire les graphes pour qu’ils fonctionnent sans couleur.
20. Corriger métadonnées, numérotation, sommaire, signets et en-têtes.

### P2 — niveau de diffusion

21. Ajouter un second micro-cas de transfert.
22. Faire relire le français par un éditeur ou une éditrice scientifique.
23. Tester le cahier pratique sans accès à la solution.
24. Tester la version PDF et HTML avec technologies d’assistance.
25. Faire une passe de cohérence terminologique et une passe de suppression distinctes.

---

## 20. Tests utilisateurs indispensables

Une refonte ne doit pas être validée seulement par l’auteur.

### Échantillon minimal

- 3 débutants ayant les prérequis déclarés ;
- 3 étudiants intermédiaires ;
- 2 lecteurs avancés ;
- au moins une personne utilisant une technologie d’assistance si le document revendique l’accessibilité.

### Tâches

1. Expliquer la chaîne complète sans regarder le schéma.
2. Trouver les prérequis d’un chapitre.
3. Dire ce qui peut être sauté.
4. Prédire l’effet d’un changement avant de voir la figure.
5. Retrouver la preuve d’une formule.
6. Compléter une courte fonction et interpréter un test en échec.
7. Distinguer espace des données et espace des paramètres.
8. Identifier quel état du modèle est utilisé.
9. Expliquer une erreur sans reprendre le vocabulaire anthropomorphe.
10. Transférer la méthode à un autre jeu de classes.

### Mesures

- réussite de la tâche ;
- temps ;
- retours en arrière ;
- mots ou symboles non compris ;
- erreurs de navigation ;
- confiance avant et après réponse ;
- capacité à rappeler l’idée 24 heures plus tard ;
- incidents d’accessibilité.

La seule question « avez-vous aimé ? » ne suffit pas.

---

## 21. Critères d’acceptation d’une nouvelle version

La refonte peut être considérée comme présentable seulement si tous les critères P0 sont satisfaits.

### Architecture

- problème complet montré avant la page 3 ;
- prédiction complète avant la page 10 ;
- tronc commun de 45 pages maximum ;
- aucun chapitre essentiel ne dépend d’un contenu expliqué plus tard ;
- avancé clairement séparé ;
- conclusion générale et suites d’apprentissage présentes.

### Pédagogie

- objectifs et prérequis pour chaque module ;
- au moins une réponse du lecteur avant chaque solution majeure ;
- exemples résolu, partiellement résolu et autonome ;
- chaque répétition change la tâche cognitive ;
- aucune notion ne revient trois fois sans rôle explicitement différent.

### Langue et terminologie

- aucun symbole en collision non signalée ;
- un référent stable par terme ;
- état du modèle identifié partout ;
- aucune personne décrite comme « coûteuse », « mauvaise » ou « apprise » ;
- distinctions visibles entre définition, hypothèse, choix, observation et résultat ;
- relecture professionnelle du français achevée.

### Design

- 24 figures maximum dans le tronc commun ;
- labels au moins à 8,5 pt ;
- code au moins à 9,5 pt ;
- aucune figure au-delà de la grille ;
- légendes majoritairement sous 35 mots ;
- figures à comparer sur la même page ;
- aucune page orpheline ;
- en-têtes et navigation cohérents.

### Accessibilité

- PDF balisé ;
- langue fr-FR ;
- ordre de lecture vérifié ;
- textes alternatifs et descriptions longues ;
- aucune information transmise par couleur seule ;
- contrastes conformes ;
- version HTML avec structure sémantique et MathML ;
- test réel au clavier et avec lecteur d’écran.

### Validation

- tests utilisateurs effectués ;
- résultats documentés ;
- problèmes bloquants corrigés ;
- nouvelle passe après correction.

---

## 22. Conclusion

Le document possède assez de matière pour devenir un bon cours. C’est précisément pour cela que son état actuel est frustrant : le contenu utile existe, mais il est enfoui sous la répétition, le micro-guidage, les transitions automatiques et une mise en page qui traite presque tout comme également important.

Le principal chantier n’est pas d’ajouter des explications. Il faut :

- choisir un lecteur principal ;
- montrer le problème immédiatement ;
- bâtir un parcours essentiel court ;
- déplacer le détail au bon niveau ;
- faire agir le lecteur ;
- stabiliser les mots et les symboles ;
- supprimer les doubles et triples narrations ;
- rendre les comparaisons simultanées ;
- cesser de personnifier les objets et d’attribuer la perte aux personnes ;
- reconstruire le PDF comme un support accessible, pas comme la sortie automatique d’un long source LaTeX.

**Verdict final : non présentable en l’état, mais récupérable par une refonte structurelle.**  
Une correction cosmétique conserverait le problème. La bonne intervention est un nouveau montage éditorial, suivi d’une réécriture, d’une recomposition visuelle et de tests avec de vrais lecteurs.
