# Petit cours de maths

$$\boxed{La\ régression\  linéaire\  à\ une\ seule\ variable}$$

---

Ce n'est pas un cours super organisé ni super complet, mais il permet au moins d'effectuer tous les calculs sereinement dans le cadre de **ft_linear_regression**

---

# Au sommaire

- [Notations et symboles](#notations)
- [0. La fonction de prédiction $h_\theta(x_i)$](#s0)
- [1. Fonction de coût $J(\theta_0,\theta_1)$](#s1)
- [2. Ce qu'on cherche exactement](#2-ce-quon-cherche-exactement)
- [3. Mathématiquement](#3-mathématiquement)
  - [a) Linéarité de la dérivée](#a-linéarité-de-la-dérivée)
  - [b) Dérivée d'un carré](#b-dérivée-dun-carré)
  - [c) La dérivée d'une expression affine](#c-la-dérivée-dune-expression-affine)
- [4. Dérivation pas à pas de $\partial J/\partial \theta_0$](#s4)
- [5. Dérivation pas à pas de $\partial J/\partial \theta_1$](#s5)
- [6. Intuitivement](#6-intuitivement)
- [7. Forme simplifiée](#7-forme-simplifiée)
- [8. Mise à jour des paramètres par descente de gradient](#8-mise-à-jour-des-paramètres-par-descente-de-gradient)
  - [a) Idée générale](#a-idée-générale-)
  - [b) Le gradient : d'où ça sort ?](#b-le-gradient--doù-ça-sort-)
  - [c) Soustraction du gradient](#c-soustraction-du-gradient)
  - [d) La règle de mise à jour](#d-la-règle-de-mise-à-jour)
  - [e) La répétition (Epoch)](#e-la-répétition-epoch)
  - [f) Qui a inventé cette méthode ?](#f-qui-a-inventé-cette-méthode-)
  - [g) Interprétation géométrique](#g-interprétation-géométrique)
  - [h) Le taux d'apprentissage $\eta$](#s8h)
- [9. Normalisation des données](#9-normalisation-des-données)
  - [a) Normalisation min-max de la variable explicative](#a-normalisation-min-max-de-la-variable-explicative)
  - [b) Normalisation min-max de la variable cible](#b-normalisation-min-max-de-la-variable-cible)
  - [c) Pourquoi normaliser ?](#c-pourquoi-normaliser-)
- [10. Dénormalisation des paramètres](#10-dénormalisation-des-paramètres)
  - [a) Relations de départ](#a-relations-de-départ)
  - [b) Développement](#b-développement)
  - [c) Cas limite](#c-cas-limite)
- [11. Mesures d'erreur et de qualité du modèle](#11-mesures-derreur-et-de-qualité-du-modèle)
  - [a) Résidu ou erreur de prédiction](#a-résidu-ou-erreur-de-prédiction)
  - [b) MSE (Mean Squared Error)](#b-mse-mean-squared-error)
  - [c) RMSE (Root Mean Squared Error)](#c-rmse-root-mean-squared-error)
  - [d) MAE (Mean Absolute Error)](#d-mae-mean-absolute-error)
  - [e) Coefficient de détermination $R^2$](#s11e)



---

<a id="notations"></a>

## Notations et symboles

| Symbole | Lecture | Signification |
|---|---|---|
| $x_i$ | « x indice i » | La $i$-ème entrée du jeu de données (ex : kilométrage) |
| $y_i$ | « y indice i » | La valeur réelle associée à $x_i$ (ex : prix) |
| $\hat{y}_i$ | « y chapeau » | La valeur **prédite** par le modèle pour $x_i$, i.e. $h_\theta(x_i)$ |
| $\bar{y}$ | « y barre » | La **moyenne** des valeurs réelles $y_i$ |
| $m$ | | Le nombre total de données dans le dataset |
| $i$ | | L'indice courant, $i \in \{1,\ldots,m\}$ |
| $\theta_0$ | « thêta zéro » | Le **biais** du modèle (ordonnée à l'origine) |
| $\theta_1$ | « thêta un » | La **pente** du modèle |
| $\theta_0^{(n)},\theta_1^{(n)}$ | « thêta normalisé » | Paramètres appris dans l'espace normalisé |
| $h_\theta(x)$ | « h paramétré par thêta » | La fonction de **prédiction** : $\theta_0+\theta_1 x$ |
| $J(\theta_0,\theta_1)$ | « J de thêta » | La **fonction de coût** (mesure l'erreur globale) |
| $\nabla J$ | « nabla J » | Le **gradient** de $J$ : vecteur des dérivées partielles |
| $\frac{\partial J}{\partial \theta_0}$ | « dérivée partielle » | La pente de $J$ dans la direction $\theta_0$ |
| $\eta$ | « êta » | Le **taux d'apprentissage** (learning rate) |
| $e_i$ | « e indice i » | Le **résidu** : $\hat{y}_i - y_i$ |
| $x^{(n)}_i,\,y^{(n)}_i$ | « normé » | Valeurs après normalisation min-max, $\in [0,1]$ |
| $x_{\min}, x_{\max}$ | | Minimum et maximum de la variable explicative |
| $y_{\min}, y_{\max}$ | | Minimum et maximum de la variable cible |
| $R^2$ | « R carré » | **Coefficient de détermination** : qualité globale du modèle, $\in (-\infty, 1]$ |
| $\sum_{i=1}^{m}$ | « somme de i=1 à m » | **Sigma** : somme de tous les termes pour $i$ allant de $1$ à $m$ |
| $\lvert u \rvert$ | « valeur absolue de u » | Distance de $u$ à zéro, toujours $\ge 0$ |
| $\lvert u \rvert^2$ | « norme au carré » | Ici : $\|\nabla J\|^2 = \left(\frac{\partial J}{\partial \theta_0}\right)^2 + \left(\frac{\partial J}{\partial \theta_1}\right)^2$ |
| $\theta \leftarrow \theta - \eta\nabla J$ | « theta prend la valeur... » | Règle de **mise à jour** (affectation itérative) |
| $\approx$ | « approximativement égal » | Égalité au **premier ordre** (développement limité) |
| $\Delta\theta$ | « delta thêta » | **Variation** (petit déplacement) appliquée à $\theta$ |
| $u \cdot v$ | « u point v » | **Produit scalaire** de deux vecteurs |
| $\in$ | « appartient à » | $x \in [0,1]$ signifie que $x$ est dans l'intervalle $[0,1]$ |
| $\min_\theta J(\theta)$ | « min de J sur thêta » | **Minimisation** : trouver $\theta$ qui rend $J$ le plus petit possible |

---

<a id="s0"></a>

## 0. La fonction de prédiction (hypothesis) $h_\theta(x_i)$

$h_\theta$ est une fonction, notée ainsi pour dire : “la fonction $h$, paramétrée par $\theta$”.  
Ici :

$$
h_\theta(x)=\theta_0+\theta_1 x
$$

Donc pour chaque donnée $x_i$, on calcule :

$$
h_\theta(x_i)=\theta_0+\theta_1 x_i
$$

C’est simplement la formule d’une droite avec $\theta_0$ le biais (ou ordonnée à l'origine) et $\theta_1$ la pente.

---

<a id="s1"></a>

## 1. Fonction de coût $J(\theta_0,\theta_1)$

On aurait pu choisir l'erreur absolue :

$$
J(\theta)=\frac{1}{m}\sum |h_\theta(x_i)-y_i|
$$

Elle est plus robuste aux grosses valeurs aberrantes, mais moins confortable pour la dérivation.

On choisira plutôt la MSE (Mean Squared Error), une forme de pénalité quadratique

$$
J(\theta_0,\theta_1)=\frac{1}{2m}\sum_{i=1}^{m}(h_\theta(x_i)-y_i)^2
$$

Elle mesure l’erreur moyenne quadratique, avec le facteur $1/2$ pour simplifier la dérivation.

---

## 2. Ce qu’on cherche exactement

On veut calculer :

$$
\frac{\partial J}{\partial \theta_0}
\qquad \text{et} \qquad
\frac{\partial J}{\partial \theta_1}
$$

En dérivée partielle :

- pour $\frac{\partial J}{\partial \theta_0}$, on considère $\theta_1$ comme constant ;
- pour $\frac{\partial J}{\partial \theta_1}$, on considère $\theta_0$ comme constant.

---

## 3. Mathématiquement

### a) Linéarité de la dérivée

$$
\frac{d}{d\theta}\left(\sum_i f_i(\theta)\right)=\sum_i \frac{d}{d\theta}f_i(\theta)
$$

et aussi

$$
\frac{d}{d\theta}(c f)=c \frac{d}{d\theta}f
$$

si $c$ est une constante.

### b) Dérivée d’un carré

$$
\frac{d}{d\theta}(u(\theta)^2)=2u(\theta)\,u'(\theta)
$$

C’est la **règle de la chaîne** (fonction composée).

### c) La dérivée d’une expression affine

Si

$$
u(\theta_0,\theta_1)=\theta_0+\theta_1 x_i-y_i
$$

alors :

- par rapport à $\theta_0$,

  $$
  \frac{\partial u}{\partial \theta_0}=1
  $$

- par rapport à $\theta_1$,

  $$
  \frac{\partial u}{\partial \theta_1}=x_i
  $$

car $x_i$ et $y_i$ sont des constantes du dataset.

---

<a id="s4"></a>

## 4. Dérivation pas à pas de $\partial J/\partial \theta_0$

On part de :

$$
J(\theta_0,\theta_1)=\frac{1}{2m}\sum_{i=1}^{m}(h_\theta(x_i)-y_i)^2
$$

Comme

$$
h_\theta(x_i)=\theta_0+\theta_1 x_i
$$

on peut écrire :

$$
J(\theta_0,\theta_1)=\frac{1}{2m}\sum_{i=1}^{m}(\theta_0+\theta_1 x_i-y_i)^2
$$

Maintenant on dérive par rapport à $\theta_0$ :

$$
\frac{\partial J}{\partial \theta_0}
=
\frac{\partial}{\partial \theta_0}
\left(
\frac{1}{2m}\sum_{i=1}^{m}(\theta_0+\theta_1 x_i-y_i)^2
\right)
$$

On sort la constante $1/(2m)$ :

$$
\frac{\partial J}{\partial \theta_0}
=
\frac{1}{2m}
\sum_{i=1}^{m}
\frac{\partial}{\partial \theta_0}
(\theta_0+\theta_1 x_i-y_i)^2
$$

Maintenant règle de la chaîne :

si

$$
u_i=\theta_0+\theta_1 x_i-y_i
$$

alors

$$
\frac{\partial}{\partial \theta_0}(u_i^2)=2u_i \frac{\partial u_i}{\partial \theta_0}
$$

Donc :

$$
\frac{\partial J}{\partial \theta_0}
=
\frac{1}{2m}
\sum_{i=1}^{m}
2(\theta_0+\theta_1 x_i-y_i)\cdot 1
$$

car

$$
\frac{\partial}{\partial \theta_0}(\theta_0+\theta_1 x_i-y_i)=1
$$

On simplifie le $2$ avec le $1/2$ :

$$
\frac{\partial J}{\partial \theta_0}
=
\frac{1}{m}
\sum_{i=1}^{m}
(\theta_0+\theta_1 x_i-y_i)
$$

et comme

$$
\theta_0+\theta_1 x_i = h_\theta(x_i)
$$

on obtient :

$$
\boxed{
\frac{\partial J}{\partial \theta_0}
=
\frac{1}{m}\sum_{i=1}^{m}(h_\theta(x_i)-y_i)
}
$$

---

<a id="s5"></a>

## 5. Dérivation pas à pas de $\partial J/\partial \theta_1$

Même départ :

$$
J(\theta_0,\theta_1)=\frac{1}{2m}\sum_{i=1}^{m}(\theta_0+\theta_1 x_i-y_i)^2
$$

On dérive par rapport à $\theta_1$ :

$$
\frac{\partial J}{\partial \theta_1}
=
\frac{\partial}{\partial \theta_1}
\left(
\frac{1}{2m}\sum_{i=1}^{m}(\theta_0+\theta_1 x_i-y_i)^2
\right)
$$

On sort la constante et on dérive terme à terme :

$$
\frac{\partial J}{\partial \theta_1}
=
\frac{1}{2m}
\sum_{i=1}^{m}
\frac{\partial}{\partial \theta_1}
(\theta_0+\theta_1 x_i-y_i)^2
$$

Règle de la chaîne :

$$
\frac{\partial}{\partial \theta_1}(u_i^2)=2u_i \frac{\partial u_i}{\partial \theta_1}
$$

avec

$$
u_i=\theta_0+\theta_1 x_i-y_i
$$

Donc :

$$
\frac{\partial J}{\partial \theta_1}
=
\frac{1}{2m}
\sum_{i=1}^{m}
2(\theta_0+\theta_1 x_i-y_i)\cdot x_i
$$

car

$$
\frac{\partial}{\partial \theta_1}(\theta_0+\theta_1 x_i-y_i)=x_i
$$

On simplifie :

$$
\frac{\partial J}{\partial \theta_1}
=
\frac{1}{m}
\sum_{i=1}^{m}
(\theta_0+\theta_1 x_i-y_i)x_i
$$

et donc :

$$
\boxed{
\frac{\partial J}{\partial \theta_1}
=
\frac{1}{m}\sum_{i=1}^{m}(h_\theta(x_i)-y_i)x_i
}
$$

---

## 6. Intuitivement

Le terme

$$
h_\theta(x_i)-y_i
$$

est l’**erreur** sur le point $i$.

Donc :

$$
\frac{\partial J}{\partial \theta_0}
=
\frac{1}{m}\sum (erreur)
$$

c’est en gros la moyenne des erreurs.

Et

$$
\frac{\partial J}{\partial \theta_1}
=
\frac{1}{m}\sum (erreur)\cdot x_i
$$

c’est la moyenne des erreurs, mais pondérée par la valeur de $x_i$.  
C’est logique : $\theta_1$ contrôle la pente, donc son influence dépend de la position en $x$.

---

## 7. Forme simplifiée

On peux retenir cette chaîne :

$$
J=\frac{1}{2m}\sum (\text{prédiction} - \text{réel})^2
$$

puis :

$$
\frac{\partial J}{\partial \theta}
=
\frac{1}{m}\sum (\text{prédiction} - \text{réel}) \cdot \frac{\partial(\text{prédiction})}{\partial \theta}
$$

Or ici :

- prédiction $= h_\theta(x_i)=\theta_0+\theta_1 x_i$
- $\frac{\partial h_\theta(x_i)}{\partial \theta_0}=1$
- $\frac{\partial h_\theta(x_i)}{\partial \theta_1}=x_i$

donc :

$$
\frac{\partial J}{\partial \theta_0}
=
\frac{1}{m}\sum (h_\theta(x_i)-y_i)\cdot 1
$$

$$
\frac{\partial J}{\partial \theta_1}
=
\frac{1}{m}\sum (h_\theta(x_i)-y_i)\cdot x_i
$$

---

## 8. Mise à jour des paramètres par descente de gradient

Après avoir défini une fonction de coût $J(\theta_0,\theta_1)$, il faut maintenant trouver les valeurs de $\theta_0$ et $\theta_1$ qui la rendent la plus petite possible.

Autrement dit, on cherche à résoudre un problème d’optimisation :

$$
\min_{\theta_0,\theta_1} J(\theta_0,\theta_1)
$$

La fonction $J$ mesure l’erreur globale du modèle.  
Plus $J$ est petite, meilleure est l’ajustement de la droite aux données.

---

### a) Idée générale ?

Le problème devient donc :

> comment faire diminuer une fonction quand elle dépend de plusieurs variables ?

En dimension 1, si l’on a une fonction $f(x)$, on sait déjà qu’une dérivée :
* positive signifie que la fonction augmente localement ;
* négative signifie qu’elle diminue localement.

Donc, pour faire baisser $f(x)$, on se déplace dans le sens opposé au signe de la dérivée.

Par exemple, si $f'(x) > 0$, on diminue $x$ ;
si $f'(x) < 0$, on augmente $x$.

En plusieurs variables, cette idée se généralise avec le **gradient**.

---

### b) Le gradient : d’où ça sort ?

Pour une fonction de plusieurs variables :

$$
J(\theta_0,\theta_1),
$$

On regroupe les dérivées partielles dans un vecteur appelé **gradient** :

$$
\nabla J(\theta_0,\theta_1)=
\left(
\frac{\partial J}{\partial \theta_0},
\frac{\partial J}{\partial \theta_1}
\right)
$$

Ce vecteur donne la direction dans laquelle la fonction $J$ augmente le plus rapidement.

Cela vient du **développement limité du premier ordre**.

En effet, si l’on effectue une petite variation

$$
(\theta_0,\theta_1)\mapsto(\theta_0+\Delta\theta_0,\theta_1+\Delta\theta_1),
$$

alors, au premier ordre :

$$
J(\theta_0+\Delta\theta_0,\theta_1+\Delta\theta_1)
\approx
J(\theta_0,\theta_1)
+
\frac{\partial J}{\partial \theta_0}\Delta\theta_0
+
\frac{\partial J}{\partial \theta_1}\Delta\theta_1
$$

Cette écriture se réécrit sous forme vectorielle :

$$
J(\theta + \Delta\theta)
\approx
J(\theta)+\nabla J(\theta)\cdot \Delta\theta
$$

où le symbole $\cdot$ désigne le produit scalaire.

C’est là que tout se joue.

---

### c) Soustraction du gradient

On veut choisir un petit déplacement $\Delta\theta$ tel que la quantité

$$
\nabla J(\theta)\cdot \Delta\theta
$$

soit **négative**, afin que $J$ diminue.

Le choix le plus naturel consiste à prendre $\Delta\theta$ dans la direction opposée au gradient :

$$
\Delta\theta = -\eta \nabla J(\theta)
$$

où $\eta > 0$ est un petit réel appelé **taux d’apprentissage**.

En remplaçant dans l’approximation précédente :

$$
J(\theta+\Delta\theta)
\approx
J(\theta)+\nabla J(\theta)\cdot(-\eta\nabla J(\theta))
$$

donc

$$
J(\theta+\Delta\theta)
\approx
J(\theta)-\eta |\nabla J(\theta)|^2
$$

or

$$
|\nabla J(\theta)|^2 \ge 0
$$

donc, tant que le gradient n’est pas nul,

$$
J(\theta+\Delta\theta) < J(\theta)
$$

au moins localement si $\eta$ est choisi assez petit.

C’est l'origine du signe **moins**.

C’est la soustraction du gradient qui fait baisser la fonction.

---

### d) La règle de mise à jour

On obtient alors la règle générale de la descente de gradient :

$$
\theta \leftarrow \theta - \eta \nabla J(\theta)
$$

Le vecteur des paramètres est donc :

$$
\theta =
\begin{pmatrix}
\theta_0 \
\theta_1
\end{pmatrix}
$$

et donc :

$$
\theta_0 \leftarrow \theta_0 - \eta \frac{\partial J}{\partial \theta_0}
$$

$$
\theta_1 \leftarrow \theta_1 - \eta \frac{\partial J}{\partial \theta_1}
$$

En remplaçant par les dérivées déjà obtenues :

$$
\theta_0
\leftarrow
\theta_0
-

\eta
\frac{1}{m}
\sum_{i=1}^{m}
\bigl(h_\theta(x_i)-y_i\bigr)
$$

$$
\theta_1
\leftarrow
\theta_1
-

\eta
\frac{1}{m}
\sum_{i=1}^{m}
\bigl(h_\theta(x_i)-y_i\bigr)x_i
$$

---

### e) La répétition (Epoch)

Une seule mise à jour ne suffit généralement pas pour atteindre le minimum.
On répète donc ce procédé :

1. calcul du gradient ;
2. petit déplacement dans la direction opposée ;
3. nouveau calcul ;
4. etc.

On construit ainsi une suite de paramètres :

$$
\theta^{(0)},\theta^{(1)},\theta^{(2)},\dots
$$

définie par

$$
\theta^{(k+1)}=\theta^{(k)}-\eta \nabla J\bigl(\theta^{(k)}\bigr)
$$

Dans le cas de la régression linéaire simple avec erreur quadratique, la fonction de coût est convexe, donc cette procédure converge vers le minimum global si le taux d’apprentissage est bien choisi.

---

### f) Qui a inventé cette méthode ?

Historiquement, l’idée de la **méthode de plus forte pente** (*method of steepest descent*) remonte à **Augustin-Louis Cauchy** au XIXe siècle, en 1847.

L’idée de minimiser une somme de carrés, elle, est encore plus ancienne et renvoie à la méthode des **moindres carrés**, associée notamment à **Legendre** et **Gauss**.

Donc il y a en réalité deux héritages mathématiques distincts :

* **les moindres carrés** pour construire la fonction d’erreur ;
* **la descente de gradient** pour trouver les paramètres qui minimisent cette erreur.

---

### g) Interprétation géométrique

On peut visualiser $J(\theta_0,\theta_1)$ comme une surface au-dessus du plan $(\theta_0,\theta_1)$.

Chaque point du plan correspond à une droite différente :

$$
h_\theta(x)=\theta_0+\theta_1 x
$$

La hauteur de la surface en ce point est la valeur de l’erreur :

$$
J(\theta_0,\theta_1)
$$

Le gradient indique alors la direction de la pente montante la plus forte.
Pour descendre vers le fond de la vallée, on prend donc la direction opposée.

C’est exactement l’image géométrique de la descente de gradient.

---

### h) Le taux d’apprentissage $\eta$

Le paramètre $\eta$ ne vient pas du calcul de la dérivée lui-même.
C’est un paramètre numérique ajouté pour contrôler la taille du pas.

* si $\eta$ est trop grand, on risque de dépasser le minimum et d’osciller ;
* si $\eta$ est trop petit, la convergence devient lente ;
* si $\eta$ est bien choisi, on descend régulièrement vers le minimum.

Donc la formule

$$
\theta \leftarrow \theta - \eta \nabla J(\theta)
$$

contient deux idées à la fois :

* la **direction** donnée par le gradient ;
* la **taille du déplacement** donnée par $\eta$.

---
## 9. Normalisation des données

Dans un problème de régression linéaire, les variables peuvent avoir des ordres de grandeur très différents.

Par exemple :

- le kilométrage peut valoir plusieurs dizaines ou centaines de milliers ;
- le prix peut valoir plusieurs milliers.

Ces échelles très différentes peuvent ralentir la descente de gradient et rendre le choix du taux d’apprentissage plus délicat.

Une solution classique parmi d'autres consiste à **normaliser** les données.

---

### a) Normalisation min-max de la variable explicative

On note :

$$
x_{\min} = \min_i x_i
\qquad \text{et} \qquad
x_{\max} = \max_i x_i
$$

La variable normalisée est alors :

$$
x_i^{(n)}=\frac{x_i-x_{\min}}{x_{\max}-x_{\min}}
$$

Si $x_{\max} > x_{\min}$, alors $x_i^{(n)}$ appartient à l’intervalle $[0,1]$.

---

### b) Normalisation min-max de la variable cible

De même, si l’on normalise aussi les valeurs $y_i$, on pose :

$$
y_{\min} = \min_i y_i
\qquad \text{et} \qquad
y_{\max} = \max_i y_i
$$

puis :

$$
y_i^{(n)}=\frac{y_i-y_{\min}}{y_{\max}-y_{\min}}
$$

On apprend alors un modèle sur les données normalisées :

$$
\hat{y}^{(n)}=\theta_0^{(n)}+\theta_1^{(n)}x^{(n)}
$$

---

### c) Pourquoi normaliser ?

La normalisation permet :

- de travailler avec des valeurs de même ordre de grandeur ;
- de stabiliser la descente de gradient ;
- d’utiliser plus facilement un taux d’apprentissage raisonnable ;
- d’obtenir une convergence souvent plus rapide.

Si toutes les variables sont déjà à des échelles comparables, son effet peut être moins visible.  
En revanche, pour des données comme `km` et `price`, elle est très utile en pratique.

---

## 10. Dénormalisation des paramètres

Après l’apprentissage sur les données normalisées, les paramètres obtenus $\theta_0^{(n)}$ et $\theta_1^{(n)}$ correspondent au modèle exprimé dans l’espace normalisé.

Or, pour prédire un prix réel à partir d’un kilométrage réel, on souhaite retrouver une équation dans les unités d’origine :

$$
\hat{y}=\theta_0+\theta_1 x
$$

Il faut donc **dénormaliser** les paramètres.

---

### a) Relations de départ

On a :

$$
x^{(n)}=\frac{x-x_{\min}}{x_{\max}-x_{\min}}
$$

et

$$
y^{(n)}=\frac{y-y_{\min}}{y_{\max}-y_{\min}}
$$

Donc :

$$
y = y_{\min} + y^{(n)}(y_{\max}-y_{\min})
$$

Comme le modèle appris sur les données normalisées est :

$$
\hat{y}^{(n)}=\theta_0^{(n)}+\theta_1^{(n)}x^{(n)}
$$

on remplace $x^{(n)}$ par son expression :

$$
\hat{y}^{(n)}=\theta_0^{(n)}+\theta_1^{(n)}\frac{x-x_{\min}}{x_{\max}-x_{\min}}
$$

Puis on revient à l’échelle réelle :

$$
\hat{y}
=
y_{\min}
+
(y_{\max}-y_{\min})
\left(
\theta_0^{(n)}
+
\theta_1^{(n)}\frac{x-x_{\min}}{x_{\max}-x_{\min}}
\right)
$$

---

### b) Développement

En développant, on obtient :

$$
\hat{y}
=
y_{\min}
+
\theta_0^{(n)}(y_{\max}-y_{\min})
+
\theta_1^{(n)}\frac{y_{\max}-y_{\min}}{x_{\max}-x_{\min}}(x-x_{\min})
$$

Puis :

$$
\hat{y}
=
y_{\min}
+
\theta_0^{(n)}(y_{\max}-y_{\min})
-
\theta_1^{(n)}\frac{y_{\max}-y_{\min}}{x_{\max}-x_{\min}}x_{\min}
+
\theta_1^{(n)}\frac{y_{\max}-y_{\min}}{x_{\max}-x_{\min}}x
$$

On reconnaît alors une forme affine réelle :

$$
\hat{y}=\theta_0+\theta_1 x
$$

avec

$$
\boxed{
\theta_1
=
\theta_1^{(n)}
\frac{y_{\max}-y_{\min}}{x_{\max}-x_{\min}}
}
$$

et

$$
\boxed{
\theta_0
=
y_{\min}
+
\theta_0^{(n)}(y_{\max}-y_{\min})
-
\theta_1 x_{\min}
}
$$

Cette formule est exactement celle utilisée lors de la dénormalisation dans le programme.

---

### c) Cas limite

Si $x_{\max}=x_{\min}$ ou $y_{\max}=y_{\min}$, la normalisation min-max n’est plus possible telle quelle, car on divise par zéro.

Dans ce cas, il faut traiter séparément ce jeu de données particulier, car cela signifie qu’il n’y a pas de variation sur la variable considérée.

---

## 11. Mesures d’erreur et de qualité du modèle

La fonction de coût $J(\theta_0,\theta_1)$ sert à **entraîner** le modèle.  
Une fois l’entraînement terminé, on peut également mesurer la qualité des prédictions à l’aide de plusieurs indicateurs.

### a) Résidu ou erreur de prédiction

Pour chaque donnée $x_i$, on note souvent :

$$
\hat{y}_i = h_\theta(x_i)
$$

la valeur prédite, puis

$$
e_i = \hat{y}_i - y_i
$$

le résidu, c’est-à-dire l’écart entre la prédiction et la valeur réelle.

---

### b) MSE (Mean Squared Error)

La MSE est l’erreur quadratique moyenne :

$$
\operatorname{MSE}=\frac{1}{m}\sum_{i=1}^{m}(\hat{y}_i-y_i)^2
$$

Elle est très proche de la fonction de coût utilisée pendant l’entraînement, puisque :

$$
J(\theta_0,\theta_1)=\frac{1}{2}\operatorname{MSE}
$$

La MSE pénalise fortement les grosses erreurs, car elles sont élevées au carré.

---

### c) RMSE (Root Mean Squared Error)

La RMSE est simplement la racine carrée de la MSE :

$$
\operatorname{RMSE}=\sqrt{\operatorname{MSE}}
$$

soit :

$$
\operatorname{RMSE}=\sqrt{\frac{1}{m}\sum_{i=1}^{m}(\hat{y}_i-y_i)^2}
$$

Elle a l’avantage d’être exprimée dans la **même unité que la variable $y$**.  
Par exemple, si $y$ est un prix en euros, la RMSE s’interprète directement en euros.

---

### d) MAE (Mean Absolute Error)

La MAE est l’erreur absolue moyenne :

$$
\operatorname{MAE}=\frac{1}{m}\sum_{i=1}^{m}\lvert \hat{y}_i-y_i\rvert
$$

Contrairement à la MSE, elle ne met pas les erreurs au carré.  
Elle est donc :

- plus simple à interpréter ;
- moins sensible aux très grandes erreurs ;
- mais moins pratique pour la dérivation dans la phase d’apprentissage.

---

<a id="s11e"></a>

### e) Coefficient de détermination $R^2$

Le coefficient de détermination compare le modèle appris à un modèle très simple qui prédirait toujours la moyenne des valeurs réelles.

On note :

$$
\bar{y}=\frac{1}{m}\sum_{i=1}^{m}y_i
$$

la moyenne des valeurs observées.  
Alors :

$$
R^2 = 1 - \frac{\sum_{i=1}^{m}(y_i-\hat{y}_i)^2}{\sum_{i=1}^{m}(y_i-\bar{y})^2}
$$

Le numérateur

$$
\sum_{i=1}^{m}(y_i-\hat{y}_i)^2
$$

mesure l’erreur quadratique du modèle.

Le dénominateur

$$
\sum_{i=1}^{m}(y_i-\bar{y})^2
$$

mesure l’erreur obtenue si l’on remplaçait toutes les prédictions par la moyenne $\bar{y}$.

#### Interprétation de $R^2$

- $R^2 = 1$ : le modèle prédit parfaitement toutes les valeurs ;
- $R^2 = 0$ : le modèle ne fait pas mieux que prédire systématiquement la moyenne ;
- $R^2 < 0$ : le modèle fait pire que cette prédiction triviale.

Ainsi, plus $R^2$ est proche de $1$, meilleur est l’ajustement global de la droite aux données.

---