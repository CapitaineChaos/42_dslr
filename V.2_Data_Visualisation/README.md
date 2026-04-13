# Solutions aux problématiques de visualisation et de comparaison entre séries

## Exercice 2.1 - Histogrammes

Pour répondre à la question « quelle matière a la distribution de notes la plus homogène entre les maisons ? », on peut tracer un histogramme pour chaque matière, en superposant les quatre maisons. La matière la plus homogène sera celle dont les quatre distributions se recouvrent le mieux.
Pour tracer les histogrammes de chaque matière pour chaque maison, il faut d'abord séparer les notes par maison, puis séparer les notes par intervalles et compter le nombre d'élèves dans chaque intervalle.

```bash
python3 histogram.py ../datasets/dataset_train.csv
```

## Exercice 2.2 - Nuages de points

Pour répondre à la question « quelles matières sont les plus corrélées entre elles ? », on peut tracer un nuage de points pour chaque paire de matières, en représentant les notes d'une matière sur l'axe des abscisses et les notes de l'autre matière sur l'axe des ordonnées. Les paires de matières les plus corrélées seront celles dont les points forment une ligne droite (positive ou négative). On peut ainsi expliquer que si un élève obtient une note dans une matière, on peut en déduire sa note dans l'autre matière. De plus si l'elève a une note élevée dans une matière, il a tendance à avoir une note élevée dans l'autre matière (corrélation positive) ou une note basse (corrélation négative).

```bash
python3 scatter.py ../datasets/dataset_train.csv
```

## Exercice 2.3 - Matrice de dispersion

Pour répondre à la question « quelles matières sont les plus similaires entre elles ? », on peut tracer une matrice de dispersion (pair plot) qui affiche un nuage de points pour chaque paire de matières, ainsi que des histogrammes sur la diagonale. On gardera en priorité les matières qui semblent les plus informatives pour distinguer les maisons en écartant celles qui sont redondantes ou peu structurées.
- Si deux matières donnent presque toujours un nuage quasi aligné sur une droite, elles portent presque la même information. On peut en garder une et écarter l'autre.
- Si une matière a un nuage très diffus, sans forme particulière, elle ne semble pas porter d'information utile pour différencier les élèves. On peut l'écarter aussi.
- On retient les matières qui montrent une séparation partielle des maisons et on écarte celles qui montrent une séparation quasi nulle (nuage circulaire ou chevauchement quasi total des maisons). 


```bash
python3 pair_plot.py ../datasets/dataset_train.csv
```


# Comparaison entre séries - Mise à l'échelle

## Problématique

L'écart type et la moyenne sont **sensibles à l'échelle** : deux séries mesurées dans des unités différentes (par exemple des notes sur 20 et des distances en kilomètres) ne peuvent pas être comparées directement.

**Exemple** - deux séries :

| Série | Valeurs | Moyenne $\bar{x}$ | Écart type $\sigma$ |
| :---- | :------ | ----------------: | ------------------: |
| A (notes /20) | 8, 10, 12, 15, 18 | 12,6 | 3,44 |
| B (distances km) | 120, 150, 200, 250, 300 | 204 | 62,2 |

L'écart type de B est 18 fois plus grand que celui de A, mais cela ne signifie pas que B est « plus dispersé » dans un sens absolu - l'unité est différente. Il faut **transformer** les données pour les rendre comparables.

---

## 1. Standardisation (score $z$)

La standardisation transforme une série de sorte qu'elle ait une **moyenne nulle** et un **écart type égal à 1**. Chaque valeur est remplacée par son nombre d'écarts types par rapport à la moyenne.

### Notations

| Symbole | Signification |
| :------ | :------------ |
| $x_i$ | valeur originale |
| $\bar{x}$ | moyenne de la série originale |
| $\sigma$ | écart type de la série originale (population) |
| $z_i$ | valeur standardisée (score $z$) |

### Formule

$$z_i = \frac{x_i - \bar{x}}{\sigma}$$

### Propriétés après transformation

$$\bar{z} = 0 \qquad \sigma_z = 1$$

### Exemple

Série A - notes /20 : 8, 10, 12, 15, 18 ($n = 5$, $\bar{x} = 12{,}6$, $\sigma = 3{,}44$)

| $i$ | $x_i$ | $x_i - \bar{x}$ | $z_i = \dfrac{x_i - \bar{x}}{\sigma}$ |
| --: | ----: | --------------: | ------------------------------------: |
|   1 |     8 |           −4,6  |                                −1,337 |
|   2 |    10 |           −2,6  |                                −0,756 |
|   3 |    12 |           −0,6  |                                −0,174 |
|   4 |    15 |           +2,4  |                                +0,698 |
|   5 |    18 |           +5,4  |                                +1,570 |

Vérification : $\bar{z} = \dfrac{-1{,}337 - 0{,}756 - 0{,}174 + 0{,}698 + 1{,}570}{5} = 0$ ✓

### Interprétation

Un score $z_i > 0$ signifie que la valeur est **au-dessus** de la moyenne ; $z_i < 0$ signifie qu'elle est **en dessous**. La standardisation ne modifie pas la **forme** de la distribution, seulement son centre et son échelle.

---

## 2. Normalisation (min-max)

La normalisation min-max transforme une série de sorte que toutes les valeurs soient comprises entre **0 et 1**. La valeur minimale devient 0, la valeur maximale devient 1.

### Notations

| Symbole | Signification |
| :------ | :------------ |
| $x_i$ | valeur originale |
| $\min$ | minimum de la série |
| $\max$ | maximum de la série |
| $x'_i$ | valeur normalisée |

### Formule

$$x'_i = \frac{x_i - \min}{\max - \min}$$

### Propriétés après transformation

$$\min(x') = 0 \qquad \max(x') = 1$$

### Exemple

Série A - notes /20 : 8, 10, 12, 15, 18 ($\min = 8$, $\max = 18$, amplitude $= 10$)

| $i$ | $x_i$ | $x_i - \min$ | $x'_i = \dfrac{x_i - \min}{\max - \min}$ |
| --: | ----: | -----------: | ----------------------------------------: |
|   1 |     8 |            0 |                                      0,00 |
|   2 |    10 |            2 |                                      0,20 |
|   3 |    12 |            4 |                                      0,40 |
|   4 |    15 |            7 |                                      0,70 |
|   5 |    18 |           10 |                                      1,00 |

### Comparaison standardisation vs normalisation

| Propriété | Standardisation ($z$) | Normalisation (min-max) |
| :-------- | :-------------------- | :---------------------- |
| Plage de sortie | $(-\infty, +\infty)$ | $[0, 1]$ |
| Moyenne transformée | 0 | dépend des données |
| Écart type transformé | 1 | dépend des données |
| Sensible aux valeurs aberrantes | oui ($\sigma$ les absorbe) | **très sensible** (min/max déplacés) |
| Préserve la forme | oui | oui |
| Usage typique | algorithmes supposant $\bar{x}=0$, $\sigma=1$ | réseaux de neurones, distances euclidiennes |

---

## 3. Mesure relative de dispersion - Coefficient de variation

Lorsqu'on veut comparer la dispersion de deux séries **sans les transformer**, on peut utiliser le **coefficient de variation** $CV$, qui exprime l'écart type en pourcentage de la moyenne.

### Formule

$$CV = \frac{\sigma}{\bar{x}} \times 100 \quad (\%)$$

### Conditions d'application

Le $CV$ n'a de sens que si $\bar{x} \ne 0$ et si toutes les valeurs sont **positives** (même signe). Si la moyenne est proche de zéro, le $CV$ devient instable et peu interprétable.

### Exemple - comparaison des deux séries

| Série | $\bar{x}$ | $\sigma$ | $CV$ |
| :---- | --------: | -------: | ---: |
| A (notes /20) | 12,6 | 3,44 | $\dfrac{3{,}44}{12{,}6} \times 100 = \mathbf{27{,}3\,\%}$ |
| B (distances km) | 204 | 62,2 | $\dfrac{62{,}2}{204} \times 100 = \mathbf{30{,}5\,\%}$ |

Les dispersions relatives sont proches (~27 % vs ~31 %), ce qui n'était pas lisible à partir des écarts types bruts (3,44 vs 62,2). La série B est légèrement plus dispersée **relativement à sa propre échelle**.

### Interprétation usuelle

| $CV$ | Interprétation |
| :--- | :------------- |
| $< 15\,\%$ | dispersion faible |
| $15\,\%$ à $35\,\%$ | dispersion modérée |
| $> 35\,\%$ | dispersion forte |

---

## 4. Homogénéité entre groupes - Application aux maisons

Dans le contexte de ce projet, on dispose de notes réparties entre quatre maisons. Avant de construire un classifieur, il est utile de mesurer dans quelle mesure une matière **sépare** les maisons ou au contraire les **mélange**. Deux outils complémentaires :

### 4.1 Décomposition de la variance (principe ANOVA)

La variance totale d'une série peut se décomposer en deux parties :

$$\sigma^2_{\text{totale}} = \sigma^2_{\text{intra}} + \sigma^2_{\text{inter}}$$

| Terme | Signification |
| :---- | :------------ |
| $\sigma^2_{\text{totale}}$ | variance de tous les élèves, toutes maisons confondues |
| $\sigma^2_{\text{intra}}$ | variance **à l'intérieur** de chaque maison (moyenne pondérée des variances par maison) |
| $\sigma^2_{\text{inter}}$ | variance **entre** les moyennes des maisons (à quel point les moyennes des maisons s'éloignent de la moyenne globale) |

$$\sigma^2_{\text{inter}} = \frac{1}{N} \sum_{g=1}^{G} n_g \left(\bar{x}_g - \bar{x}\right)^2$$

où $G$ est le nombre de groupes (maisons), $n_g$ l'effectif du groupe $g$, $\bar{x}_g$ sa moyenne et $\bar{x}$ la moyenne globale.

### 4.2 Eta carré $\eta^2$ - pouvoir discriminant d'une matière

L'**eta carré** mesure la proportion de la variance totale expliquée par l'appartenance à une maison :

$$\eta^2 = \frac{\sigma^2_{\text{inter}}}{\sigma^2_{\text{totale}}}$$

| $\eta^2$ | Interprétation |
| :------- | :------------- |
| $\approx 0$ | la matière ne distingue pas les maisons - inutile pour la classification |
| $0{,}01$ à $0{,}06$ | effet faible |
| $0{,}06$ à $0{,}14$ | effet modéré |
| $> 0{,}14$ | effet fort - la matière est un bon discriminant |

**Exemple** - si pour Astronomie $\eta^2 = 0{,}82$, cela signifie que 82 % de la variance des notes s'explique par la maison : c'est une matière très discriminante. Si pour Arithmancy $\eta^2 = 0{,}01$, les maisons ont des distributions quasi identiques : cette matière n'aide pas à classer.

### 4.3 Cohen's $d$ - comparaison entre deux maisons

Pour comparer deux maisons $A$ et $B$ sur une matière donnée, le **$d$ de Cohen** mesure l'écart entre leurs moyennes en unités d'écart type poolé :

$$d = \frac{\bar{x}_A - \bar{x}_B}{s_{\text{poolé}}} \qquad \text{avec} \qquad s_{\text{poolé}} = \sqrt{\frac{(n_A - 1)s_A^2 + (n_B - 1)s_B^2}{n_A + n_B - 2}}$$

| $|d|$ | Interprétation |
| ----: | :------------- |
| $< 0{,}2$ | effet négligeable |
| $0{,}2$ à $0{,}5$ | petit effet |
| $0{,}5$ à $0{,}8$ | effet moyen |
| $> 0{,}8$ | grand effet |

---

## 5. Similarité entre deux features — Corrélation de Pearson

Lorsqu'on veut savoir si deux matières **évoluent de la même façon** d'un élève à l'autre, on mesure leur corrélation linéaire. L'idée : si un élève a une note élevée en matière $X$, a-t-il tendance à avoir une note élevée (ou basse) en matière $Y$ ?

### Notations

| Symbole | Signification |
| :------ | :------------ |
| $x_i$, $y_i$ | notes de l'élève $i$ en matière $X$ et $Y$ |
| $\bar{x}$, $\bar{y}$ | moyennes respectives |
| $n$ | nombre d'élèves ayant une note dans les deux matières |
| $r_{X,Y}$ | coefficient de corrélation de Pearson |

### Formule

$$r_{X,Y} = \frac{\displaystyle\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\displaystyle\sum_{i=1}^{n}(x_i - \bar{x})^2} \cdot \sqrt{\displaystyle\sum_{i=1}^{n}(y_i - \bar{y})^2}}$$

$r \in [-1, 1]$, sans unité.

### Interprétation

| $r$ | Interprétation |
| --: | :------------- |
| $\approx +1$ | forte liaison linéaire croissante — quand $X$ monte, $Y$ monte |
| $\approx -1$ | forte liaison linéaire décroissante — quand $X$ monte, $Y$ descend |
| $\approx 0$ | pas de liaison linéaire |

### Lien avec la visualisation

Un scatter plot $(x_i, y_i)$ traduit directement $r$ :

| Forme du nuage | $r$ |
| :------------- | --: |
| points alignés en diagonale montante | proche de $+1$ |
| points alignés en diagonale descendante | proche de $-1$ |
| nuage diffus, quasi circulaire | proche de $0$ |

La **paire de matières la plus similaire** est celle dont le $|r|$ est le plus proche de $1$ — son scatter plot montre un nuage très resserré autour d'une droite.

### Exemple chiffré (3 élèves)

$X$ = Arithmancy : 58 000, 67 000, 24 000 — $\bar{x} = 49 667$

$Y$ = Astronomy : 493, 510, 305 — $\bar{y} = 436$

| $i$ | $x_i - \bar{x}$ | $y_i - \bar{y}$ | produit |
| --: | --------------: | --------------: | ------: |
|   1 |          +8 333 |             +57 |  475 000 |
|   2 |         +17 333 |             +74 | 1 283 000 |
|   3 |         −25 667 |            −131 | 3 362 000 |

$$r = \frac{475\,000 + 1\,283\,000 + 3\,362\,000}{\sqrt{(8333^2 + 17333^2 + 25667^2)} \cdot \sqrt{(57^2 + 74^2 + 131^2)}} \approx +0{,}99$$

Sur cet échantillon minimal les deux matières semblent liées — sur les 1 600 élèves réels du dataset le résultat diffère, mais la démarche est identique.

---

## 6. Récapitulatif

| Méthode | Formule | Plage | Usage |
| :------ | :------ | :---- | :---- |
| Standardisation | $z_i = \dfrac{x_i - \bar{x}}{\sigma}$ | $\mathbb{R}$ | rendre les matières comparables avant classification |
| Normalisation min-max | $x'_i = \dfrac{x_i - \min}{\max - \min}$ | $[0, 1]$ | mise à l'échelle pour distances euclidiennes |
| Coefficient de variation | $CV = \dfrac{\sigma}{\bar{x}} \times 100\,\%$ | $[0\,\%, \infty)$ | comparer la variabilité de deux matières d'échelles différentes |
| Décomposition de variance | $\sigma^2_{\text{tot}} = \sigma^2_{\text{intra}} + \sigma^2_{\text{inter}}$ | $[0, \sigma^2_{\text{tot}}]$ | diagnostiquer si les maisons ont des profils distincts |
| Eta carré $\eta^2$ | $\dfrac{\sigma^2_{\text{inter}}}{\sigma^2_{\text{tot}}}$ | $[0, 1]$ | identifier les matières discriminantes, écarter celles à $\eta^2 \approx 0$ |
| Cohen's $d$ | $\dfrac{\bar{x}_A - \bar{x}_B}{s_{\text{poolé}}}$ | $\mathbb{R}$ | quantifier si deux maisons sont séparables sur une matière |
| Corrélation de Pearson | $r_{X,Y} = \dfrac{\sum(x_i-\bar{x})(y_i-\bar{y})}{\sqrt{\sum(x_i-\bar{x})^2}\cdot\sqrt{\sum(y_i-\bar{y})^2}}$ | $[-1, 1]$ | identifier les deux matières les plus similaires (scatter plot) |
