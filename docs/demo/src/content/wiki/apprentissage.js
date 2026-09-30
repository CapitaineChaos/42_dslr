export const APPRENTISSAGE = {
  'descente-gradient': {
    title: 'Descente de gradient',
    short: 'Méthode itérative qui déplace les paramètres dans le sens opposé au gradient.',
    body: String.raw`
      <p>La descente de gradient cherche un minimum de \(J\) en répétant la même correction. À
      partir de poids initiaux, chaque [[iteration|itération]] calcule le [[gradient]] et
      déplace les poids dans la direction opposée :</p>
      \[ w \leftarrow w - \alpha\, \nabla J(w). \]
      <p>Le [[pas-apprentissage|pas]] \(\alpha\) règle la longueur du déplacement. Près du
      minimum, le gradient devient petit, et les corrections aussi. La boucle s'arrête quand un
      [[critere-arret|critère d'arrêt]] est satisfait.</p>
      <p>La méthode n'utilise que les dérivées premières. Chaque itération coûte peu, mais la
      descente peut demander beaucoup d'itérations quand le [[conditionnement]] est mauvais.
      Cauchy l'a proposée en 1847.</p>`,
  },
  'pas-apprentissage': {
    title: 'Pas d\'apprentissage',
    short: 'Facteur α qui règle la longueur de chaque correction des poids.',
    body: String.raw`
      <p>Le pas \(\alpha\) multiplie le gradient dans la mise à jour
      \(w \leftarrow w - \alpha \nabla J\). Un pas trop petit fait converger la descente
      lentement. Un pas trop grand la fait osciller, voire diverger, car la correction dépasse
      le minimum.</p>
      <p>Pour une fonction dont le [[lipschitz|gradient est L-lipschitzien]], tout pas
      \(\alpha < 2/L\) fait baisser \(J\) à chaque itération. La démo utilise \(\alpha = 1\),
      avec des notes [[standardisation|standardisées]].</p>`,
  },
  'critere-arret': {
    title: 'Critère d\'arrêt',
    short: 'Condition qui termine la descente ; ici, la norme du gradient passe sous 10⁻³.',
    body: String.raw`
      <p>Une descente de gradient n'atteint presque jamais le minimum exactement. Elle s'arrête
      quand une condition indique que les poids en sont assez proches. Le critère de la démo et
      de dslr porte sur la [[norme]] du gradient :</p>
      \[ \lVert \nabla J(w) \rVert < \varepsilon, \qquad \varepsilon = 10^{-3}. \]
      <p>Une limite sur le nombre d'itérations, ici 6000, arrête aussi une descente qui ne
      converge pas, par exemple quand les classes sont [[separabilite|séparables]].</p>`,
  },
  perte: {
    title: 'Fonction de perte',
    short: 'Mesure de l\'écart entre la prédiction et la valeur attendue pour une observation.',
    body: String.raw`
      <p>Une fonction de perte associe à chaque observation un nombre positif, d'autant plus
      grand que la prédiction est mauvaise. Elle traduit le but de l'apprentissage en une
      quantité à minimiser.</p>
      <p>La moyenne des pertes sur les observations d'entraînement est le [[cout|coût]], la
      quantité que la descente minimise. La perte doit être dérivable pour que ce minimum
      puisse être cherché par descente de gradient. Le
      nombre d'erreurs ne convient pas, car il est constant par morceaux, donc son gradient est
      nul presque partout. La régression logistique utilise l'[[entropie-croisee|entropie
      croisée]], la régression linéaire l'écart quadratique.</p>`,
  },
  cout: {
    title: 'Fonction de coût',
    short: 'Moyenne des pertes sur les élèves d\'entraînement, notée J ; la quantité que la descente minimise.',
    body: String.raw`
      <p>La [[perte]] \(\ell_i\) juge le modèle sur un seul élève. Le coût \(J\) le juge sur
      tous les élèves d'entraînement à la fois, par la moyenne de leurs pertes :</p>
      \[ J(w) = \frac{1}{n}\sum_{i=1}^{n} \ell_i(w). \]
      <p>Les poids sont communs à tous les élèves, donc la descente de gradient minimise
      \(J\), et non la perte d'un élève en particulier. \(\ell_i\) dépend des poids à
      travers le score \(z_i\) de l'élève, et \(J\) ne dépend que des poids, les données
      étant fixées.</p>
      <p>Les deux termes varient selon les auteurs. En anglais, <i>loss</i> désigne souvent la
      perte d'une observation et <i>cost</i> la moyenne, mais certains textes appellent aussi
      \(J\) la perte.</p>`,
  },
  iteration: {
    title: 'Itération',
    short: 'Un tour de la boucle de correction : scores, probabilités, perte, gradient, mise à jour.',
    body: String.raw`
      <p>Une itération de la descente enchaîne le calcul des scores, des probabilités, de la
      perte et du gradient, puis la mise à jour des poids. L'itération \(t\) part des poids
      \(w^{(t)}\) et produit \(w^{(t+1)}\). Les poids de l'itération 0 sont nuls.</p>
      <p>Chaque itération utilise tous les élèves d'entraînement. Cette variante s'appelle
      descente de gradient par lot. Les variantes stochastiques utilisent un élève ou un petit
      groupe d'élèves par itération.</p>`,
  },
  'validation-croisee': {
    title: 'Validation croisée',
    short: 'Estimation de l\'exactitude sur des données non vues, en réentraînant le modèle sans chaque pli.',
    body: String.raw`
      <p>La validation croisée à \(k\) plis partage les données d'apprentissage en \(k\) parts,
      les plis. Chaque passage met un pli de côté, entraîne le modèle sur les \(k - 1\) autres,
      puis classe les élèves du pli mis de côté. Chaque élève est ainsi classé une fois par un
      modèle qui ne l'a pas vu.</p>
      <p>L'exactitude de ces décisions estime celle du modèle sur de nouveaux élèves. Mesurée
      sur les élèves d'entraînement, elle serait optimiste, car les poids ont été ajustés sur
      eux ([[surapprentissage]]). Avec peu de données, la validation croisée utilise chaque
      élève pour le test sans le retirer définitivement de l'entraînement.</p>`,
  },
  stratification: {
    title: 'Plis stratifiés',
    short: 'Plis qui gardent les proportions des classes de l\'ensemble des données.',
    body: String.raw`
      <p>Des plis stratifiés contiennent chacun à peu près la même proportion de chaque classe
      que l'ensemble des données. Ici, les élèves de chaque maison sont distribués tour à tour
      entre les cinq plis.</p>
      <p>Sans stratification, un petit pli pourrait ne contenir aucun élève d'une maison, et
      son évaluation ne dirait rien de cette maison.</p>`,
  },
  surapprentissage: {
    title: 'Surapprentissage',
    short: 'Modèle ajusté aux particularités de ses données d\'entraînement, moins bon sur des données nouvelles.',
    body: String.raw`
      <p>Un modèle surapprend quand il s'ajuste aux particularités de ses données
      d'entraînement au lieu de la tendance générale. Son exactitude sur ces données dépasse
      alors celle qu'il obtient sur des données nouvelles.</p>
      <p>Un modèle à trois poids entraîné sur une vingtaine d'élèves a peu de liberté, et
      l'écart reste faible. La mesure sur des élèves mis de côté, par
      [[validation-croisee|validation croisée]] ou sur les élèves réservés, donne une
      estimation sans ce biais optimiste.</p>`,
  },
};
