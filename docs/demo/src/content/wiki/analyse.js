export const ANALYSE = {
  derivee: {
    title: 'Dérivée',
    short: 'Pente d\'une fonction en un point : variation de la sortie pour une petite variation de l\'entrée.',
    body: String.raw`
      <p>La dérivée \(f'(a)\) d'une fonction \(f\) en \(a\) est la pente de sa tangente en ce
      point :</p>
      \[ f'(a) = \lim_{h \to 0} \frac{f(a + h) - f(a)}{h}. \]
      <p>Pour une petite variation \(h\), \(f(a + h) \approx f(a) + f'(a)\,h\). Une dérivée
      positive indique que \(f\) augmente quand \(a\) augmente, une dérivée négative qu'elle
      diminue. Au minimum d'une fonction dérivable, la dérivée est nulle.</p>
      <p>Le cours utilise les dérivées \((e^z)' = e^z\), \((\ln u)' = u'/u\) et
      \(\sigma'(z) = \sigma(z)\,(1 - \sigma(z))\).</p>`,
  },
  'derivee-partielle': {
    title: 'Dérivée partielle',
    short: 'Dérivée par rapport à une seule variable, les autres restant fixées.',
    body: String.raw`
      <p>Pour une fonction de plusieurs variables, la dérivée partielle
      \(\partial J / \partial w_j\) est la [[derivee|dérivée]] de \(J\) par rapport à \(w_j\),
      les autres poids restant fixés. Elle mesure l'effet sur \(J\) d'une petite variation du
      seul poids \(w_j\). Le symbole \(\partial\) se lit « d rond ».</p>
      <p>Par exemple, pour \(z = w_0 + w_1 x_1 + w_2 x_2\), \(\partial z / \partial w_1 = x_1\),
      car \(w_0\) et \(w_2 x_2\) ne dépendent pas de \(w_1\).</p>`,
  },
  'derivation-chaine': {
    title: 'Dérivation en chaîne',
    short: 'Dérivée d\'une fonction de fonction : produit des dérivées de chaque étape.',
    body: String.raw`
      <p>Quand une grandeur dépend d'une autre, qui dépend elle-même d'une troisième, les
      dérivées se multiplient. Si \(\ell\) dépend de \(z\) et \(z\) de \(w_j\),</p>
      \[ \frac{\partial \ell}{\partial w_j} = \frac{\partial \ell}{\partial z}\,
         \frac{\partial z}{\partial w_j}. \]
      <p>Dans le cours, \(\partial \ell / \partial z = p - y\) et
      \(\partial z / \partial w_j = x_j\), donc \(\partial \ell / \partial w_j = (p - y)\,x_j\).
      Chaque élève contribue au [[gradient]] par son erreur multipliée par sa note. La
      rétropropagation des réseaux de neurones applique la même règle à travers plusieurs
      couches.</p>`,
  },
  gradient: {
    title: 'Gradient',
    short: 'Vecteur des dérivées partielles ; il indique la direction de plus forte hausse.',
    body: String.raw`
      <p>Le gradient de \(J\) est le [[vecteur]] de ses
      [[derivee-partielle|dérivées partielles]]. Le symbole \(\nabla\) se lit « nabla ».</p>
      \[ \nabla J = \Big(\frac{\partial J}{\partial w_0}, \frac{\partial J}{\partial w_1},
         \dots, \frac{\partial J}{\partial w_d}\Big) \]
      <p>Pour un petit déplacement \(\delta\) des poids,
      \(J(w + \delta) \approx J(w) + \nabla J^{\mathsf T} \delta\). Parmi les déplacements de
      même longueur, celui qui augmente le plus \(J\) est dans la direction de \(\nabla J\), et
      celui qui la diminue le plus dans la direction opposée. La
      [[descente-gradient|descente de gradient]] suit cette direction opposée.</p>
      <p>Au minimum de \(J\), toutes les dérivées partielles sont nulles, donc
      \(\nabla J = 0\). Sa [[norme]] mesure l'écart à cette condition.</p>`,
  },
  convexite: {
    title: 'Convexité',
    short: 'Fonction en forme de cuvette, sans bosse ni creux secondaire. Le creux qu\'une descente y trouve est le plus bas.',
    body: String.raw`
      <p>Une fonction convexe a la forme d'une cuvette. Sa courbe tourne toujours vers le haut,
      sans bosse et sans creux secondaire. \(x^2\), \(e^x\) et \(|x|\) sont convexes. \(\sin x\)
      ne l'est pas, car sa courbe alterne bosses et creux.</p>
      <p>Une descente sur une fonction convexe ne peut pas rester bloquée dans un creux
      secondaire, puisqu'il n'y en a pas. Tout [[minimum|minimum local]] est global. C'est ce
      qui permet à la descente de gradient de trouver les meilleurs poids, quand ils
      existent.</p>
      <h4>Définition</h4>
      <p>Soit deux points de la courbe, d'abscisses \(a\) et \(b\), reliés par un segment. La
      fonction est convexe quand, pour tous \(a\) et \(b\), la courbe reste sous ce segment
      :</p>
      \[ f\big(t a + (1 - t) b\big) \le t f(a) + (1 - t) f(b), \qquad 0 \le t \le 1. \]
      <p>Pour une fonction deux fois dérivable d'une variable, cela revient à \(f'' \ge 0\),
      c'est-à-dire que la pente ne fait qu'augmenter. Pour plusieurs variables, cela revient à
      une [[hessienne]] dont les [[valeurs-propres|valeurs propres]] sont positives ou
      nulles.</p>
      <h4>Convexité de J</h4>
      <p>Une somme de fonctions convexes est convexe, et une fonction convexe composée avec une
      fonction [[fonction-affine|affine]] reste convexe. La perte \(\ell\) est convexe en
      \(z\), et \(z\) est affine en \(w\), donc \(J\) est convexe en \(w\).</p>`,
  },
  minimum: {
    title: 'Minimum local et global',
    short: 'Global : la plus petite valeur de la fonction. Local : la plus petite dans un voisinage.',
    body: String.raw`
      <p>Un point \(w^*\) est un minimum global de \(J\) quand \(J(w^*) \le J(w)\) pour tout
      \(w\). C'est un minimum local quand l'inégalité vaut seulement pour les \(w\) proches de
      \(w^*\). Une méthode qui suit la pente, comme la
      [[descente-gradient|descente de gradient]], trouve un minimum local, et pas
      nécessairement le global.</p>
      <p>Pour une fonction [[convexite|convexe]], les deux notions coïncident. Une fonction
      peut aussi n'avoir aucun minimum. Quand une droite sépare les classes, \(J\) diminue sans
      fin quand les poids grandissent, et tend vers 0 sans l'atteindre.</p>`,
  },
  lipschitz: {
    title: 'Gradient lipschitzien',
    short: 'Gradient qui ne change pas brutalement : sa variation est au plus L fois le déplacement des poids.',
    body: String.raw`
      <p>Le gradient de \(J\) est \(L\)-lipschitzien quand, pour tous poids \(a\) et \(b\),</p>
      \[ \lVert \nabla J(a) - \nabla J(b) \rVert \le L\, \lVert a - b \rVert. \]
      <p>La constante \(L\) borne la courbure de \(J\). Pour une fonction convexe deux fois
      dérivable, \(L\) est la borne supérieure, sur tout l'espace, de la plus grande
      [[valeurs-propres|valeur propre]] de la [[hessienne]]. Avec cette borne, un
      [[pas-apprentissage|pas]] \(\alpha < 2/L\) fait baisser \(J\) à chaque mise à jour, tant
      que le gradient n'est pas nul.</p>`,
  },
  logarithme: {
    title: 'Logarithme',
    short: 'Réciproque de l\'exponentielle : ln(eˣ) = x ; il change les produits en sommes.',
    body: String.raw`
      <p>Le logarithme népérien \(\ln\) est la réciproque de l'exponentielle :
      \(\ln(e^x) = x\) pour tout réel \(x\), et \(e^{\ln u} = u\) pour \(u > 0\). Il n'est
      défini que pour \(u > 0\), vaut 0 en 1 et tend vers \(-\infty\) quand \(u\) tend vers
      0.</p>
      <p>Sa propriété principale est \(\ln(ab) = \ln a + \ln b\). Elle transforme le produit
      des probabilités de la [[vraisemblance]] en somme de pertes. Comme \(\ln\) est croissant,
      une quantité positive et son logarithme atteignent leur maximum au même point.</p>`,
  },
  bijection: {
    title: 'Bijection',
    short: 'Fonction dont chaque valeur est atteinte par exactement une entrée.',
    body: String.raw`
      <p>Une fonction \(f : A \to B\) est une bijection quand chaque élément de \(B\) est
      l'image d'exactement un élément de \(A\). Elle a alors une réciproque \(f^{-1}\), qui
      renvoie chaque valeur à son entrée.</p>
      <p>La [[sigmoide|sigmoïde]] est une bijection de \(\mathbb{R}\) sur \(]0, 1[\). Toute
      probabilité strictement comprise entre 0 et 1 correspond à un seul score, donné par le
      [[logit]].</p>`,
  },
};
