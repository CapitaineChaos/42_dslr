# Statistiques descriptives

```bash
./describe.py ../datasets/dataset_train.csv
```

## 1. Cadres de travail

On distingue deux présentations usuelles d'une série statistique quantitative.

### 1.1 Données simples

Chaque observation est écrite individuellement.

| Observation | Valeur |
| ----------- | -----: |
| 1           |      8 |
| 2           |     10 |
| 3           |     12 |
| 4           |     15 |

### 1.2 Données avec effectifs

Plutôt que de répéter chaque observation, on regroupe les valeurs identiques : chaque valeur distincte est listée une seule fois avec son nombre d'occurrences, appelé **effectif**.

| Valeur | Effectif |
| ------ | -------: |
| 8      |        2 |
| 10     |        3 |
| 12     |        4 |
| 15     |        1 |

Ce tableau est équivalent à la série : 8, 8, 10, 10, 10, 12, 12, 12, 12, 15 (10 observations au total).

---

## 2. Effectif et notations

### Notations utilisées dans tout le document

| Symbole | Signification |
| :------ | :------------ |
| $n$ | nombre total d'observations (données simples) |
| $k$ | nombre de **valeurs distinctes** (données avec effectifs) |
| $x_i$ | la $i$-ème valeur distincte, $i$ allant de $1$ à $k$ (valeurs triées par ordre croissant) |
| $n_i$ | effectif de $x_i$ : combien de fois $x_i$ apparaît dans la série |
| $N$ | effectif total (données avec effectifs) : $N = \displaystyle\sum_{i=1}^{k} n_i$ |
| $C_i$ | effectif **cumulé** jusqu'à $x_i$ : $C_i = \displaystyle\sum_{j=1}^{i} n_j$ (combien d'observations ont une valeur $\le x_i$) |

### Effectif total

* **Données simples** : l'effectif est directement $n$, le nombre de valeurs dans la liste.
* **Données avec effectifs** : $N = n_1 + n_2 + \dots + n_k$ (somme de tous les effectifs par valeur).

**Exemple** avec le tableau de la section 1.2 ($k = 4$ valeurs distinctes) :

$$N = n_1 + n_2 + n_3 + n_4 = 2 + 3 + 4 + 1 = 10$$

| $i$ | $x_i$ (valeur) | $n_i$ (effectif) | $C_i$ (cumulé) |
| --: | -------------: | ---------------: | -------------: |
|   1 |              8 |                2 |              2 |
|   2 |             10 |                3 |              5 |
|   3 |             12 |                4 |              9 |
|   4 |             15 |                1 |             10 |

---

## 3. Minimum et maximum

Après classement dans l'ordre croissant :

* le **minimum** est la plus petite valeur observée ;
* le **maximum** est la plus grande valeur observée.

### 3.1 Données simples

On trie la série puis on lit directement les extrêmes.

**Exemple** — série brute : 10, 5, 15, 8, 12 ($n = 5$)

Série triée :

| Rang | Valeur |
| ---: | -----: |
|    1 |      **5** ← minimum |
|    2 |      8 |
|    3 |     10 |
|    4 |     12 |
|    5 |     **15** ← maximum |

$$\min = 5 \qquad \max = 15$$

### 3.2 Données avec effectifs

Le minimum est la première valeur du tableau (ligne $i=1$, celle avec le plus petit $x_i$) et le maximum est la dernière ($i=k$), à condition que leur effectif soit non nul — ce qui est toujours le cas si le tableau est propre.

**Exemple** — tableau standard ($k = 5$, $N = 12$)

| $i$ | Valeur $x_i$ | Effectif $n_i$ |
| --: | -----------: | -------------: |
|   1 |       **5** ← minimum |              1 |
|   2 |            8 |              2 |
|   3 |           10 |              3 |
|   4 |           12 |              4 |
|   5 |      **15** ← maximum |              2 |

$$\min = 5 \qquad \max = 15$$

---

## 4. Médiane

La médiane est une valeur centrale de la série ordonnée.

### 4.1 Données simples

Soit une série ordonnée

$$x_{(1)} \le x_{(2)} \le \dots \le x_{(n)}$$

* si $n$ est impair, la médiane est la valeur de rang $\dfrac{n+1}{2}$

* si $n$ est pair, la médiane est la moyenne des deux valeurs centrales

$$\text{médiane} = \frac{x_{(n/2)} + x_{(n/2+1)}}{2}$$

**Exemple — cas impair** : série ordonnée 5, 8, 10, 12, 15 ($n = 5$)

Rang central : $\dfrac{5+1}{2} = 3$

| Rang | Valeur | Note |
| ---: | -----: | :--- |
|    1 |      5 |      |
|    2 |      8 |      |
|    3 |     10 | ← **rang central 3** |
|    4 |     12 |      |
|    5 |     15 |      |

$$\text{médiane} = 10$$

**Exemple — cas pair** : série ordonnée 5, 8, 10, 12 ($n = 4$)

Rangs centraux : $\dfrac{4}{2} = 2$ et $\dfrac{4}{2}+1 = 3$

| Rang | Valeur | Note |
| ---: | -----: | :--- |
|    1 |      5 |      |
|    2 |      8 | ← **rang central 1** |
|    3 |     10 | ← **rang central 2** |
|    4 |     12 |      |

$$\text{médiane} = \frac{8 + 10}{2} = 9$$

### 4.2 Données avec effectifs

Principe : le cumulé $C_i$ indique combien d'observations ont une valeur $\le x_i$. La valeur $x_i$ "occupe" donc les rangs de $C_{i-1}+1$ à $C_i$ dans la série complète reconstituée. On cherche quelle(s) valeur(s) se trouvent aux rangs centraux.

Rangs centraux à trouver :
* $N$ impair → un seul rang central : $\dfrac{N+1}{2}$
* $N$ pair → deux rangs centraux : $\dfrac{N}{2}$ et $\dfrac{N}{2}+1$

Si les deux rangs tombent sur la **même** valeur → c'est la médiane. Sinon → moyenne des deux valeurs.

**Exemple — $N = 12$ (pair), rangs centraux : 6 et 7**

Tableau compact (une ligne par valeur distincte) :

| $i$ | Valeur $x_i$ | Effectif $n_i$ | Cumulé $C_i$ | Plage de rangs occupés |
| --: | -----------: | -------------: | -----------: | :--------------------- |
|   1 |            5 |              1 |            1 | rang 1                 |
|   2 |            8 |              2 |            3 | rangs 2 – 3            |
|   3 |           10 |              3 |            6 | rangs 4 – 6            |
|   4 |           12 |              4 |           10 | rangs 7 – 10           |
|   5 |           15 |              2 |           12 | rangs 11 – 12          |

Tableau déroulé (une ligne par observation, série complète reconstituée) :

| Rang | Valeur | Note |
| ---: | -----: | :--- |
|    1 |      5 |      |
|    2 |      8 |      |
|    3 |      8 |      |
|    4 |     10 |      |
|    5 |     10 |      |
|    6 |     10 | ← **rang central 1** ($N/2 = 6$) → valeur **10** |
|    7 |     12 | ← **rang central 2** ($N/2+1 = 7$) → valeur **12** |
|    8 |     12 |      |
|    9 |     12 |      |
|   10 |     12 |      |
|   11 |     15 |      |
|   12 |     15 |      |

Deux valeurs distinctes aux rangs centraux :

$$\text{médiane} = \frac{10 + 12}{2} = 11$$

---

## 5. Quartiles

Les quartiles sont définis sur la série ordonnée.

* $Q_1$ est une valeur telle qu'au moins 25 % des observations lui sont inférieures ou égales.
* $Q_3$ est une valeur telle qu'au moins 75 % des observations lui sont inférieures ou égales.

### 5.1 Données simples

On adopte la convention usuelle suivante :

$$Q_1 = x_{\left(\lceil n/4 \rceil\right)} \qquad\text{et}\qquad Q_3 = x_{\left(\lceil 3n/4 \rceil\right)}$$

où $\lceil \cdot \rceil$ désigne l'arrondi à l'entier supérieur.

Ainsi, lorsque $n/4$ ou $3n/4$ n'est pas entier, on retient le premier rang entier supérieur.

**Exemple** — série ordonnée : 3, 7, 8, 12, 14, 18, 21, 25 ($n = 8$)

Rangs-seuils : $Q_1 \to \lceil 8/4 \rceil = 2$ et $Q_3 \to \lceil 3 \times 8/4 \rceil = 6$

| Rang | Valeur | Note |
| ---: | -----: | :--- |
|    1 |      3 |      |
|    2 |      7 | ← **rang-seuil $Q_1 = 2$** → $Q_1 = \mathbf{7}$ |
|    3 |      8 |      |
|    4 |     12 |      |
|    5 |     14 |      |
|    6 |     18 | ← **rang-seuil $Q_3 = 6$** → $Q_3 = \mathbf{18}$ |
|    7 |     21 |      |
|    8 |     25 |      |

### 5.2 Données avec effectifs

Même principe qu'en 4.2 : on reconstitue la série complète via les plages de rangs, puis on lit la valeur au rang-seuil.

Rangs-seuils à trouver :
* $Q_1$ → rang-seuil $= \lceil N/4 \rceil$
* $Q_3$ → rang-seuil $= \lceil 3N/4 \rceil$

La valeur cherchée est celle dont la plage de rangs **contient** le rang-seuil.

**Exemple — même série, $N = 12$**

Rangs-seuils : $Q_1 \to \lceil 12/4 \rceil = 3$ et $Q_3 \to \lceil 3 \times 12/4 \rceil = 9$

Tableau compact :

| $i$ | Valeur $x_i$ | Effectif $n_i$ | Cumulé $C_i$ | Plage de rangs occupés |
| --: | -----------: | -------------: | -----------: | :--------------------- |
|   1 |            5 |              1 |            1 | rang 1                 |
|   2 |            8 |              2 |            3 | rangs 2 – 3            |
|   3 |           10 |              3 |            6 | rangs 4 – 6            |
|   4 |           12 |              4 |           10 | rangs 7 – 10           |
|   5 |           15 |              2 |           12 | rangs 11 – 12          |

Tableau déroulé :

| Rang | Valeur | Note |
| ---: | -----: | :--- |
|    1 |      5 |      |
|    2 |      8 |      |
|    3 |      8 | ← **rang-seuil $Q_1 = 3$** → $Q_1 = \mathbf{8}$ |
|    4 |     10 |      |
|    5 |     10 |      |
|    6 |     10 |      |
|    7 |     12 |      |
|    8 |     12 |      |
|    9 |     12 | ← **rang-seuil $Q_3 = 9$** → $Q_3 = \mathbf{12}$ |
|   10 |     12 |      |
|   11 |     15 |      |
|   12 |     15 |      |

### 5.3 Cas de faible effectif

Lorsque la série contient très peu de valeurs, les quartiles existent encore dès lors que la série n'est pas vide, mais leur interprétation est naturellement limitée.

---

## 6. Moyenne

### 6.1 Données simples

$\bar{x}$ désigne la moyenne, $x_i$ la $i$-ème valeur de la série, $n$ le nombre total de valeurs.

$$\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i = \frac{x_1 + x_2 + \dots + x_n}{n}$$

**Exemple** — série 5, 8, 10, 12, 15 ($n = 5$)

$$\bar{x} = \frac{5 + 8 + 10 + 12 + 15}{5} = \frac{50}{5} = 10$$

### 6.2 Données avec effectifs

Chaque valeur $x_i$ est **pondérée** par son effectif $n_i$ : une valeur qui apparaît 3 fois contribue 3 fois dans la somme.

$$\bar{x} = \frac{1}{N} \sum_{i=1}^{k} n_i x_i = \frac{n_1 x_1 + n_2 x_2 + \dots + n_k x_k}{N}$$

**Exemple** — tableau standard ($N = 12$)

| $i$ | $x_i$ | $n_i$ | $n_i \times x_i$ |
| --: | ----: | ----: | ---------------: |
|   1 |     5 |     1 |                5 |
|   2 |     8 |     2 |               16 |
|   3 |    10 |     3 |               30 |
|   4 |    12 |     4 |               48 |
|   5 |    15 |     2 |               30 |
| **Total** | | **12** | **129** |

$$\bar{x} = \frac{129}{12} = 10{,}75$$

---

## 7. Écart type

L'écart type mesure la dispersion des valeurs autour de la moyenne.

### 7.1 Population complète

#### Données simples

$\sigma$ est l'écart type, $\bar{x}$ la moyenne, $(x_i - \bar{x})^2$ le carré de l'écart de chaque valeur à la moyenne.

$$\sigma = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (x_i - \bar{x})^2}$$

**Exemple** — série 5, 8, 10, 12, 15 ($n = 5$, $\bar{x} = 10$)

| $i$ | $x_i$ | $x_i - \bar{x}$ | $(x_i - \bar{x})^2$ |
| --: | ----: | --------------: | ------------------: |
|   1 |     5 |              −5 |                  25 |
|   2 |     8 |              −2 |                   4 |
|   3 |    10 |               0 |                   0 |
|   4 |    12 |              +2 |                   4 |
|   5 |    15 |              +5 |                  25 |
| **Somme** | | | **58** |

$$\sigma = \sqrt{\frac{58}{5}} = \sqrt{11{,}6} \approx 3{,}41$$

#### Données avec effectifs

Chaque carré d'écart est pondéré par l'effectif $n_i$ de la valeur correspondante.

$$\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^{k} n_i (x_i - \bar{x})^2}$$

**Exemple** — tableau standard ($N = 12$, $\bar{x} = 10{,}75$)

| $i$ | $x_i$ | $n_i$ | $x_i - \bar{x}$ | $(x_i - \bar{x})^2$ | $n_i (x_i - \bar{x})^2$ |
| --: | ----: | ----: | --------------: | ------------------: | ----------------------: |
|   1 |     5 |     1 |          −5,75  |             33,0625 |                 33,0625 |
|   2 |     8 |     2 |          −2,75  |              7,5625 |                 15,1250 |
|   3 |    10 |     3 |          −0,75  |              0,5625 |                  1,6875 |
|   4 |    12 |     4 |          +1,25  |              1,5625 |                  6,2500 |
|   5 |    15 |     2 |          +4,25  |             18,0625 |                 36,1250 |
| **Total** | | **12** | | | **92,25** |

$$\sigma = \sqrt{\frac{92{,}25}{12}} = \sqrt{7{,}6875} \approx 2{,}77$$

### 7.2 Échantillon

Lorsqu'on travaille sur un échantillon et non sur une population complète, on emploie la correction de Bessel.

#### Données simples

Seule différence avec $\sigma$ : on divise par $n-1$ au lieu de $n$ (correction de Bessel). Les carrés d'écarts sont les mêmes.

$$s = \sqrt{\frac{1}{n-1} \sum_{i=1}^{n} (x_i - \bar{x})^2}$$

**Exemple** — mêmes valeurs que 7.1 (somme des carrés $= 58$, $n = 5$)

$$s = \sqrt{\frac{58}{5-1}} = \sqrt{\frac{58}{4}} = \sqrt{14{,}5} \approx 3{,}81$$

#### Données avec effectifs

Même principe : diviseur $N-1$ au lieu de $N$.

$$s = \sqrt{\frac{1}{N-1} \sum_{i=1}^{k} n_i (x_i - \bar{x})^2}$$

**Exemple** — mêmes valeurs que 7.1 (somme pondérée $= 92{,}25$, $N = 12$)

$$s = \sqrt{\frac{92{,}25}{12-1}} = \sqrt{\frac{92{,}25}{11}} = \sqrt{8{,}386} \approx 2{,}90$$

---

## 8. Récapitulatif

| Indicateur         | Données simples                                       | Données avec effectifs                          |
| ------------------ | ----------------------------------------------------- | ----------------------------------------------- |
| Effectif           | nombre de valeurs                                     | somme des effectifs                             |
| Minimum            | plus petite valeur                                    | plus petite valeur d'effectif non nul           |
| Maximum            | plus grande valeur                                    | plus grande valeur d'effectif non nul           |
| Médiane            | valeur centrale ou moyenne des deux valeurs centrales | lecture à partir des effectifs cumulés          |
| Premier quartile   | rang $\lceil n/4 \rceil$                              | premier cumulé $\ge N/4$                        |
| Troisième quartile | rang $\lceil 3n/4 \rceil$                             | premier cumulé $\ge 3N/4$                       |
| Moyenne            | moyenne arithmétique                                  | moyenne pondérée                                |
| Écart type         | formule usuelle                                       | formule pondérée                                |
