# Construction d’un contour plot et tracé de la trajectoire de la descente de gradient

## Sommaire

- [1. Objet](#s1)
- [2. Notations](#s2)
- [3. Table des symboles](#s3)
- [4. Fonction de coût dans le plan des paramètres](#s4)
- [5. Courbes de niveau](#s5)
- [6. Discrétisation du plan des paramètres](#s6)
- [7. Détection du franchissement d’un niveau sur une maille](#s7)
- [8. Interpolation linéaire sur une arête](#s8)
- [9. Assemblage d’une courbe de niveau](#s9)
- [10. Construction d’un contour plot complet](#s10)
- [11. Gradient de la fonction de coût](#s11)
- [12. Itérations de la descente de gradient](#s12)

---

<a id="s1"></a>
## 1. Objet

Le document expose la construction numérique d’un contour plot de la fonction de coût associée à une régression linéaire simple, puis le tracé de la trajectoire de la descente de gradient dans le même plan.

Deux objets distincts interviennent :

1. les **courbes de niveau** de la fonction de coût ;
2. la **suite des paramètres** produite par la descente de gradient.

Le contour plot ne représente pas les données dans le plan usuel $(x,y)$. Il représente la valeur de la fonction de coût dans le plan des paramètres $(\theta_0,\theta_1)$.

---

<a id="s2"></a>
## 2. Notations

Soit un ensemble de données

$$
\mathcal D = \{(x_1,y_1),\dots,(x_m,y_m)\}.
$$

Le modèle affine étudié est

$$
h_\theta(x)=\theta_0+\theta_1 x,
$$

où $\theta_0$ et $\theta_1$ sont les paramètres.

La fonction de coût quadratique est

$$
J(\theta_0,\theta_1)=\frac{1}{2m}\sum_{i=1}^m\bigl(\theta_0+\theta_1 x_i-y_i\bigr)^2.
$$

Le plan étudié est donc

$$
\mathbb R^2
$$

muni des coordonnées $(\theta_0,\theta_1)$.

---

<a id="s3"></a>
## 3. Table des symboles

| Symbole | Définition |
|---|---|
| $\mathcal D$ | ensemble des observations |
| $m$ | nombre total d’observations |
| $(x_i,y_i)$ | $i$-ième observation |
| $\theta_0$ | ordonnée à l’origine du modèle |
| $\theta_1$ | pente du modèle |
| $\theta=(\theta_0,\theta_1)$ | vecteur des paramètres |
| $h_\theta(x)$ | prédiction du modèle pour l’entrée $x$ |
| $\hat y_i$ | prédiction associée à $x_i$ |
| $J(\theta_0,\theta_1)$ | fonction de coût |
| $L$ | niveau fixé pour définir une courbe de niveau |
| $\mathcal C_L$ | courbe de niveau associée au niveau $L$ |
| $Z_{i,j}$ | valeur de la fonction de coût sur le point de grille d’indices $(i,j)$ |
| $A,B,C,D$ | sommets d’une maille rectangulaire de la grille |
| $z_A,z_B,z_C,z_D$ | valeurs de la fonction aux sommets d’une maille |
| $P$ | point d’intersection approché entre une courbe de niveau et une arête |
| $t$ | paramètre d’interpolation sur une arête |
| $\nabla J$ | gradient de la fonction de coût |
| $\eta$ | learning rate |
| $(\theta_0^{(k)},\theta_1^{(k)})$ | paramètres à l’itération $k$ |
| $k$ | indice d’itération |

---

<a id="s4"></a>
## 4. Fonction de coût dans le plan des paramètres

À chaque couple $(\theta_0,\theta_1)$ est associée une droite

$$
x \longmapsto \theta_0+\theta_1 x.
$$

Cette droite produit, sur le jeu de données, une erreur globale mesurée par

$$
J(\theta_0,\theta_1)=\frac{1}{2m}\sum_{i=1}^m\bigl(\theta_0+\theta_1 x_i-y_i\bigr)^2.
$$

La fonction de coût est donc une application

$$
J:\mathbb R^2 \longrightarrow \mathbb R.
$$

Le couple $(\theta_0,\theta_1)$ joue le rôle de variable.  
La valeur $J(\theta_0,\theta_1)$ joue le rôle d’altitude.

Construire un contour plot consiste à représenter certaines courbes d’altitude constante de cette fonction.

---

<a id="s5"></a>
## 5. Courbes de niveau

Fixer un réel $L$. La courbe de niveau associée à $L$ est l’ensemble

$$
\mathcal C_L
=
\left\{
(\theta_0,\theta_1)\in\mathbb R^2
\;\middle|\;
J(\theta_0,\theta_1)=L
\right\}.
$$

Une courbe de niveau contient donc tous les couples de paramètres qui donnent exactement la même valeur du coût.

Un contour plot est obtenu en choisissant plusieurs niveaux

$$
L_1,L_2,\dots,L_p
$$

puis en traçant les ensembles

$$
\mathcal C_{L_1},\mathcal C_{L_2},\dots,\mathcal C_{L_p}.
$$

Le problème central n’est donc pas la fonction $J$ seule, mais la construction numérique des ensembles solutions de l’équation

$$
J(\theta_0,\theta_1)=L.
$$

---

<a id="s6"></a>
## 6. Discrétisation du plan des paramètres

Une bibliothèque de tracé ne résout généralement pas l’équation précédente sous forme symbolique. Elle commence par discrétiser le domaine étudié.

Choisir d’abord un rectangle du plan des paramètres :

$$
\theta_0\in[a,b],
\qquad
\theta_1\in[c,d].
$$

Construire ensuite deux suites régulières de valeurs :

$$
\theta_0^{(0)},\theta_0^{(1)},\dots,\theta_0^{(n-1)},
$$

$$
\theta_1^{(0)},\theta_1^{(1)},\dots,\theta_1^{(m-1)}.
$$

Ces suites déterminent une grille de points :

$$
(\theta_0^{(j)},\theta_1^{(i)}).
$$

Évaluer alors la fonction de coût sur tous les points de la grille :

$$
Z_{i,j}=J\!\left(\theta_0^{(j)},\theta_1^{(i)}\right).
$$

Le tableau $Z=(Z_{i,j})$ constitue un échantillonnage numérique de la fonction de coût sur le domaine choisi.

Une fois ce tableau construit, la bibliothèque ne manipule plus la formule de $J$. Elle manipule une grille de valeurs numériques.

---

<a id="s7"></a>
## 7. Détection du franchissement d’un niveau sur une maille

La grille découpe le plan en mailles rectangulaires. Considérer une maille dont les sommets sont

$$
A=(x_0,y_0),\quad
B=(x_1,y_0),\quad
C=(x_1,y_1),\quad
D=(x_0,y_1),
$$

avec les valeurs associées

$$
z_A,\quad z_B,\quad z_C,\quad z_D.
$$

Fixer un niveau $L$.

Le problème local consiste à déterminer si la courbe de niveau $J=L$ traverse la maille.

### 7.1. Cas d’absence de traversée

Si les quatre valeurs sont strictement inférieures à $L$, aucun point de la maille n’appartient à la courbe de niveau, dans l’approximation locale.

De même, si les quatre valeurs sont strictement supérieures à $L$, la maille n’est pas traversée.

### 7.2. Cas de traversée

La maille est traversée lorsqu’au moins une arête possède des extrémités situées de part et d’autre du niveau $L$.

Sur une arête reliant deux sommets $U$ et $V$, de valeurs respectives $z_U$ et $z_V$, il y a franchissement lorsque

$$
(z_U-L)(z_V-L)\le 0
$$

avec changement effectif de signe si $z_U\neq z_V$.

Cette condition signifie que le niveau $L$ se situe entre $z_U$ et $z_V$.

---

<a id="s8"></a>
## 8. Interpolation linéaire sur une arête

Supposer que la courbe de niveau coupe l’arête $[U,V]$.

Un point quelconque de cette arête s’écrit

$$
P(t)=U+t(V-U),
\qquad 0\le t\le 1.
$$

Les valeurs de la fonction n’étant connues qu’aux sommets, la variation de la fonction le long de l’arête est approchée linéairement :

$$
z(t)\approx z_U+t(z_V-z_U).
$$

Le point d’intersection avec le niveau $L$ est obtenu en imposant

$$
z(t)=L.
$$

Ainsi,

$$
z_U+t(z_V-z_U)=L.
$$

Résoudre par rapport à $t$ :

$$
t=\frac{L-z_U}{z_V-z_U}.
$$

La position approchée du point d’intersection est donc

$$
P
=
U+\frac{L-z_U}{z_V-z_U}(V-U).
$$

Cette formule est la relation centrale de la construction numérique d’un contour plot.

### 8.1. Développement coordonnée par coordonnée

Si

$$
U=(u_0,u_1),
\qquad
V=(v_0,v_1),
$$

alors

$$
P=
\left(
u_0+\frac{L-z_U}{z_V-z_U}(v_0-u_0),
\;
u_1+\frac{L-z_U}{z_V-z_U}(v_1-u_1)
\right).
$$

L’intersection est donc calculée explicitement à partir des coordonnées des sommets et des valeurs de la fonction à ces sommets.

---

<a id="s9"></a>
## 9. Assemblage d’une courbe de niveau

Une fois les points d’intersection déterminés sur les arêtes d’une maille, la portion locale de courbe de niveau est approchée par un segment joignant deux intersections.

Le traitement est répété maille par maille sur tout le domaine.

Le résultat est une famille de petits segments. L’assemblage de ces segments produit une approximation polygonale de la courbe de niveau complète.

Le principe de construction est donc :

1. parcourir toutes les mailles ;
2. repérer les arêtes franchies par le niveau ;
3. calculer les intersections par interpolation ;
4. relier les intersections à l’intérieur de la maille ;
5. raccorder les segments entre mailles voisines.

La courbe affichée n’est donc pas la solution exacte au sens algébrique. C’est une approximation numérique obtenue sur un maillage.

---

<a id="s10"></a>
## 10. Construction d’un contour plot complet

La construction précédente concerne un seul niveau $L$.

Pour obtenir un contour plot, choisir plusieurs niveaux

$$
L_1,L_2,\dots,L_p.
$$

Pour chaque niveau $L_r$ :

1. parcourir toutes les mailles ;
2. détecter les franchissements sur les arêtes ;
3. calculer les intersections ;
4. construire les segments locaux ;
5. assembler les segments.

Le contour plot final est l’union de toutes les courbes ainsi construites.

Le nombre de niveaux est un paramètre d’affichage.  
La géométrie globale dépend uniquement du tableau des valeurs de la fonction de coût.

---

<a id="s11"></a>
## 11. Gradient de la fonction de coût

La descente de gradient nécessite les dérivées partielles de la fonction de coût.

Partir de

$$
J(\theta_0,\theta_1)=\frac{1}{2m}\sum_{i=1}^m\bigl(\theta_0+\theta_1x_i-y_i\bigr)^2.
$$

Dériver par rapport à $\theta_0$ :

$$
\frac{\partial J}{\partial \theta_0}
=
\frac{1}{2m}\sum_{i=1}^m 2\bigl(\theta_0+\theta_1x_i-y_i\bigr)
=
\frac{1}{m}\sum_{i=1}^m\bigl(\theta_0+\theta_1x_i-y_i\bigr).
$$

Dériver par rapport à $\theta_1$ :

$$
\frac{\partial J}{\partial \theta_1}
=
\frac{1}{2m}\sum_{i=1}^m 2\bigl(\theta_0+\theta_1x_i-y_i\bigr)x_i
=
\frac{1}{m}\sum_{i=1}^m\bigl(\theta_0+\theta_1x_i-y_i\bigr)x_i.
$$

Le gradient est donc

$$
\nabla J(\theta_0,\theta_1)
=
\left(
\frac{\partial J}{\partial \theta_0},
\frac{\partial J}{\partial \theta_1}
\right).
$$

---

<a id="s12"></a>
## 12. Itérations de la descente de gradient

Fixer un point initial

$$
(\theta_0^{(0)},\theta_1^{(0)}).
$$

À chaque itération $k$, calculer le gradient au point courant puis appliquer la mise à jour

$$
\theta_0^{(k+1)}
=
\theta_0^{(k)}
-
\eta\,
\frac{\partial J}{\partial \theta_0}
\bigl(\theta_0^{(k)},\theta_1^{(k)}\bigr),
$$

$$
\theta_1^{(k+1)}
=
\theta_1^{(k)}
-
\eta\,
\frac{\partial J}{\partial \theta_1}
\bigl(\theta_0^{(k)},\theta_1^{(k)}\bigr),
$$

où $\eta>0$ est le learning rate.

En remplaçant les dérivées par leurs expressions explicites :

$$
\theta_0^{(k+1)}
=
\theta_0^{(k)}
-
\eta\,
\frac{1}{m}
\sum_{i=1}^m
\bigl(\theta_0^{(k)}+\theta_1^{(k)}x_i-y_i\bigr),
$$

$$
\theta_1^{(k+1)}
=
\theta_1^{(k)}
-
\eta\,
\frac{1}{m}
\sum_{i=1}^m
\bigl(\theta_0^{(k)}+\theta_1^{(k)}x_i-y_i\bigr)x_i.
$$

Chaque itération fournit un nouveau point du plan des paramètres.

La trajectoire de la descente de gradient est donc la suite

$$
(\theta_0^{(0)},\theta_1^{(0)}),
(\theta_0^{(1)},\theta_1^{(1)}),
\dots,
(\theta_0^{(K)},\theta_1^{(K)}).
$$
