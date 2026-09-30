export const ALGEBRE = {
  vecteur: {
    title: 'Vecteur',
    short: 'Liste ordonnée de nombres, par exemple les poids (w₀, w₁, w₂).',
    body: String.raw`
      <p>Un vecteur est une liste ordonnée de nombres, ses composantes. Le vecteur des poids
      \(w = (w_0, w_1, \dots, w_d)\) a \(d + 1\) composantes. Les notes standardisées d'un élève,
      précédées d'un 1, forment aussi un vecteur : \(x_i = (1, x_{i1}, \dots, x_{id})\).</p>
      <p>Avec deux matières, un vecteur de deux notes est un point du plan, ou la flèche qui va
      de l'origine à ce point. Les opérations sur les vecteurs se font composante par
      composante. Par exemple, \(w - \alpha\,\nabla J\) retranche à chaque poids la composante
      correspondante du gradient, multipliée par \(\alpha\).</p>`,
  },
  norme: {
    title: 'Norme',
    short: 'Longueur d\'un vecteur : ‖v‖ = √(v₁² + v₂² + …).',
    body: String.raw`
      <p>La norme euclidienne d'un [[vecteur]] \(v = (v_1, \dots, v_d)\) est sa longueur :</p>
      \[ \lVert v \rVert = \sqrt{v_1^2 + v_2^2 + \dots + v_d^2}. \]
      <p>Pour \(v = (3, 4)\), \(\lVert v \rVert = \sqrt{9 + 16} = 5\). La notation
      \(\lVert (w_1, \dots, w_d) \rVert\) désigne la norme du vecteur formé par les poids des
      notes, sans \(w_0\).</p>
      <p>La norme n'est nulle que pour le vecteur nul. La norme du [[gradient]],
      \(\lVert \nabla J \rVert\), sert donc de [[critere-arret|critère d'arrêt]], car elle
      n'est nulle qu'au point où toutes les dérivées partielles s'annulent.</p>`,
  },
  'produit-scalaire': {
    title: 'Produit scalaire',
    short: 'Somme des produits terme à terme de deux vecteurs : wᵀx = w₀x₀ + w₁x₁ + w₂x₂ + ….',
    body: String.raw`
      <p>Le produit scalaire de deux vecteurs de même longueur est la somme des produits de
      leurs composantes :</p>
      \[ w^{\mathsf T} x = w_0 x_0 + w_1 x_1 + \dots + w_d x_d. \]
      <p>La notation \(w^{\mathsf T} x\) vient du calcul matriciel. \(w\) et \(x\) y sont des
      colonnes, et la [[transposee|transposée]] \(w^{\mathsf T}\) est la ligne qui se multiplie
      avec la colonne \(x\). Le score d'un élève est le produit scalaire des poids et de ses
      notes, avec \(x_0 = 1\) pour que \(w_0\) s'ajoute tel quel.</p>
      <p>Géométriquement, \(w^{\mathsf T} x = \lVert w \rVert\,\lVert x \rVert \cos\theta\), où
      \(\theta\) est l'angle entre les deux vecteurs. Le produit est nul quand les vecteurs sont
      perpendiculaires.</p>`,
  },
  transposee: {
    title: 'Transposée',
    short: 'Matrice obtenue en échangeant lignes et colonnes, notée Xᵀ.',
    body: String.raw`
      <p>La transposée \(X^{\mathsf T}\) d'une [[matrice]] \(X\) échange ses lignes et ses
      colonnes. L'élément à la ligne \(i\) et à la colonne \(j\) de \(X\) se retrouve à la ligne
      \(j\) et à la colonne \(i\) de \(X^{\mathsf T}\). Une matrice de \(n\) lignes et
      \(d + 1\) colonnes donne une matrice de \(d + 1\) lignes et \(n\) colonnes.</p>
      <p>Dans le gradient \(\nabla J = \frac{1}{n} X^{\mathsf T}(p - y)\), la ligne \(j\) de
      \(X^{\mathsf T}\) contient la note \(j\) de tous les élèves. Son produit avec le vecteur
      des erreurs \(p - y\) donne \(\sum_i (p_i - y_i)\,x_{ij}\).</p>`,
  },
  matrice: {
    title: 'Matrice',
    short: 'Tableau rectangulaire de nombres ; X a une ligne par élève et une colonne par poids.',
    body: String.raw`
      <p>Une matrice est un tableau rectangulaire de nombres. La matrice des données \(X\) a une
      ligne par élève et une colonne par poids :</p>
      \[ X = \begin{pmatrix} 1 & x_{11} & x_{12} \\ 1 & x_{21} & x_{22} \\ \vdots & \vdots & \vdots \\ 1 & x_{n1} & x_{n2} \end{pmatrix}. \]
      <p>Le produit \(Xw\) calcule en une opération les scores de tous les élèves. Sa
      composante \(i\) est le [[produit-scalaire|produit scalaire]] de la ligne \(i\) et de
      \(w\). L'écriture matricielle ne change rien au calcul. Elle regroupe les \(n\) scores ou
      les \(d + 1\) dérivées en une seule formule, et correspond aux opérations vectorisées de
      numpy.</p>`,
  },
  hyperplan: {
    title: 'Hyperplan',
    short: 'Généralisation de la droite : une droite avec 2 notes, un plan avec 3, un hyperplan au-delà.',
    body: String.raw`
      <p>Dans un espace à \(d\) dimensions, un hyperplan est l'ensemble des points \(x\) qui
      vérifient une équation [[fonction-affine|affine]] :</p>
      \[ w_0 + w_1 x_1 + \dots + w_d x_d = 0. \]
      <p>Pour \(d = 2\), c'est une droite du plan. Pour \(d = 3\), c'est un plan. Un hyperplan
      coupe l'espace en deux demi-espaces. L'expression de gauche est positive dans l'un et
      négative dans l'autre. La [[frontiere-decision|frontière de décision]] d'un modèle est un
      hyperplan. dslr, avec 10 matières, travaille dans un espace à 10 dimensions.</p>`,
  },
  'vecteur-normal': {
    title: 'Vecteur normal',
    short: 'Vecteur perpendiculaire à une droite ou à un hyperplan.',
    body: String.raw`
      <p>Un vecteur est normal à un [[hyperplan]] quand il est perpendiculaire à toutes les
      directions contenues dans l'hyperplan. Pour l'hyperplan
      \(w_0 + w_1 x_1 + \dots + w_d x_d = 0\), le vecteur \(\tilde w = (w_1, \dots, w_d)\) est
      normal.</p>
      <p>Deux points \(a\) et \(b\) de l'hyperplan vérifient la même équation, donc
      \(\tilde w^{\mathsf T}(a - b) = 0\). Le vecteur \(\tilde w\) est donc perpendiculaire à
      tout déplacement dans l'hyperplan. Il pointe vers le côté où le score est positif, et le
      score augmente le plus vite dans sa direction.</p>`,
  },
  'distance-frontiere': {
    title: 'Distance à la frontière',
    short: 'Distance d\'un point à l\'hyperplan z = 0 : |z| divisé par la norme de (w₁, w₂, …).',
    body: String.raw`
      <p>Soit \(\tilde w = (w_1, \dots, w_d)\) le vecteur des poids des notes, sans \(w_0\). La
      distance d'un point \(x\) de l'espace des notes à la frontière \(z = 0\) vaut</p>
      \[ \operatorname{dist}(x) = \frac{|w_0 + \tilde w^{\mathsf T} x|}{\lVert \tilde w \rVert}
         = \frac{|z|}{\lVert \tilde w \rVert}. \]
      <p>La formule s'obtient en partant de \(x\) dans la direction du
      [[vecteur-normal|vecteur normal]] \(\tilde w\), qui est le plus court chemin vers
      l'hyperplan. Un déplacement de longueur \(t\) dans cette direction change le score de
      \(t\,\lVert \tilde w \rVert\). Le score passe donc de \(z\) à 0 après une longueur
      \(|z| / \lVert \tilde w \rVert\).</p>
      <p>Le score d'un élève est sa distance à la frontière multipliée par
      \(\lVert \tilde w \rVert\), avec un signe qui indique le côté. Quand les poids grandissent
      sans que la frontière bouge, les scores grandissent, et la [[sigmoide|sigmoïde]] donne des
      probabilités plus proches de 0 ou de 1.</p>`,
  },
  hessienne: {
    title: 'Hessienne',
    short: 'Tableau des dérivées secondes de J ; il décrit comment J se courbe dans chaque direction.',
    body: String.raw`
      <p>La hessienne d'une fonction de plusieurs variables est la [[matrice]] de ses dérivées
      partielles secondes. Pour \(J(w_0, \dots, w_d)\), le terme à la ligne \(j\) et à la
      colonne \(k\) vaut \(\partial^2 J / \partial w_j \partial w_k\).</p>
      <p>La dérivée seconde d'une fonction d'une variable mesure sa courbure. La hessienne
      généralise cette mesure. La courbure de \(J\) dans une direction \(u\) de norme 1 vaut
      \(u^{\mathsf T} H u\). Pour le coût de la régression logistique,</p>
      \[ H = \frac{1}{n}\sum_{i=1}^{n} p_i(1 - p_i)\, x_i x_i^{\mathsf T}. \]
      <p>Ses [[valeurs-propres|valeurs propres]] sont toutes positives ou nulles, ce qui traduit
      la [[convexite|convexité]] de \(J\).</p>`,
  },
  'valeurs-propres': {
    title: 'Valeurs propres',
    short: 'Pour la hessienne, courbures de J dans ses directions principales.',
    body: String.raw`
      <p>Un vecteur non nul \(u\) est un vecteur propre d'une matrice carrée \(H\) quand
      \(Hu = \lambda u\). Le nombre \(\lambda\) est la valeur propre associée. La matrice étire
      alors \(u\) d'un facteur \(\lambda\) sans changer sa direction.</p>
      <p>Une matrice symétrique comme la [[hessienne]] a des directions propres
      perpendiculaires entre elles. Ses valeurs propres sont les courbures de la fonction le
      long de ces directions. La plus grande, \(\lambda_{\max}\), et la plus petite,
      \(\lambda_{\min}\), encadrent la courbure dans toutes les autres directions.</p>`,
  },
  conditionnement: {
    title: 'Conditionnement',
    short: 'Rapport entre la plus forte et la plus faible courbure de J ; grand, il ralentit la descente.',
    body: String.raw`
      <p>Le conditionnement de la [[hessienne]] est le rapport
      \(\kappa = \lambda_{\max} / \lambda_{\min}\) de sa plus grande et de sa plus petite
      [[valeurs-propres|valeur propre]]. Il vaut 1 quand \(J\) est aussi courbée dans toutes les
      directions. Ses lignes de niveau sont alors des cercles.</p>
      <p>Quand \(\kappa\) est grand, les lignes de niveau sont des ellipses très allongées. Le
      [[pas-apprentissage|pas]] doit rester sous \(2/\lambda_{\max}\) pour que la descente ne
      diverge pas dans la direction la plus courbée. Dans la direction la moins courbée, ce pas
      fait alors très peu progresser, et la descente zigzague au fond de la vallée. Le nombre
      d'itérations nécessaires croît à peu près proportionnellement à \(\kappa\).</p>
      <p>Des notes d'échelles différentes augmentent \(\kappa\). La
      [[standardisation]] les ramène à la même échelle.</p>`,
  },
};
