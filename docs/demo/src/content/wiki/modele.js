export const MODELE = {
  'regression-logistique': {
    title: 'Régression logistique',
    short: 'Modèle de classification binaire : p = σ(w₀ + w₁x₁ + w₂x₂ + …).',
    body: String.raw`
      <p>La régression logistique prédit la probabilité qu'une observation appartienne à une
      classe. Elle combine les variables en un score affine, puis convertit ce score en
      probabilité par la [[sigmoide|sigmoïde]] :</p>
      \[ p = \sigma\Big(w_0 + \sum_{j=1}^{d} w_j x_j\Big). \]
      <p>Les poids sont choisis par maximum de [[vraisemblance]], ce qui revient à minimiser
      l'[[entropie-croisee|entropie croisée]] moyenne. Aucune formule fermée ne donne ces
      poids, d'où l'usage d'une méthode itérative comme la
      [[descente-gradient|descente de gradient]].</p>
      <p>C'est une méthode de classification malgré son nom. Le mot « régression » vient de ce
      que le modèle est une régression linéaire du [[logit]] de la probabilité. Cox l'a
      formalisée en 1958.</p>`,
  },
  'classification-binaire': {
    title: 'Classification binaire',
    short: 'Problème à deux classes, codées 1 et 0.',
    body: String.raw`
      <p>Une classification binaire attribue chaque observation à l'une de deux classes,
      codées 1 (positive) et 0 (négative). Ici, la classe positive est « élève de la maison du
      modèle », la classe négative « élève d'une autre maison ».</p>
      <p>Un problème à plus de deux classes se ramène à plusieurs problèmes binaires, par
      exemple par la méthode [[un-contre-tous|un contre tous]].</p>`,
  },
  'un-contre-tous': {
    title: 'Un contre tous',
    short: 'Un modèle binaire par classe, qui oppose cette classe à toutes les autres.',
    body: String.raw`
      <p>La méthode un contre tous traite un problème à \(K\) classes avec \(K\) modèles
      binaires. Le modèle \(h\) apprend à distinguer la classe \(h\) de toutes les autres
      réunies. Pour une nouvelle observation, chaque modèle donne un score, et la classe retenue
      est celle du plus grand score ([[argmax]]).</p>
      <p>Chaque modèle est entraîné séparément, donc leurs probabilités ne somment pas à 1. La
      [[regression-multinomiale|régression multinomiale]] évite ce défaut avec un modèle
      unique.</p>`,
  },
  'regression-multinomiale': {
    title: 'Régression multinomiale',
    short: 'Régression logistique à K classes, dont les probabilités somment à 1.',
    body: String.raw`
      <p>La régression multinomiale entraîne un seul modèle à \(K\) scores
      \(z_1, \dots, z_K\), convertis en probabilités par la fonction softmax :</p>
      \[ p_h = \frac{e^{z_h}}{\sum_{k=1}^{K} e^{z_k}}. \]
      <p>Les probabilités sont positives et somment à 1. Pour \(K = 2\), le modèle se ramène à
      la régression logistique binaire. dslr utilise la méthode
      [[un-contre-tous|un contre tous]], dont chaque modèle est une régression binaire.</p>`,
  },
  'fonction-affine': {
    title: 'Fonction affine',
    short: 'Fonction de la forme w₀ + w₁x₁ + w₂x₂ + …, linéaire plus une constante.',
    body: String.raw`
      <p>Une fonction affine des notes s'écrit \(w_0 + w_1 x_1 + \dots + w_d x_d\). Elle est
      linéaire quand \(w_0 = 0\). Le terme constant \(w_0\), appelé biais, déplace la frontière
      sans changer son orientation.</p>
      <p>Le score de la régression logistique est affine par rapport aux notes, et aussi par
      rapport aux poids. Cette seconde propriété rend \(J\) [[convexite|convexe]] en \(w\).</p>`,
  },
  sigmoide: {
    title: 'Sigmoïde',
    short: 'σ(z) = 1 / (1 + e^(−z)), fonction croissante de ℝ dans ]0, 1[.',
    body: String.raw`
      <p>La sigmoïde, ou fonction logistique, est</p>
      \[ \sigma(z) = \frac{1}{1 + e^{-z}}. \]
      <p>Elle est strictement croissante, vaut 1/2 en 0, tend vers 0 en \(-\infty\) et vers 1
      en \(+\infty\). Elle vérifie \(\sigma(-z) = 1 - \sigma(z)\), et sa dérivée est
      \(\sigma'(z) = \sigma(z)\,(1 - \sigma(z))\). Sa réciproque est le [[logit]].</p>
      <p>Pour \(|z| > 5\), \(\sigma(z)\) est à moins de 0.007 de 0 ou de 1. Un score de 5
      correspond donc déjà à une quasi-certitude. Verhulst a introduit cette fonction en 1838
      pour décrire la croissance d'une population limitée par ses ressources.</p>`,
  },
  'frontiere-decision': {
    title: 'Frontière de décision',
    short: 'Ensemble des points où le modèle hésite : z = 0, soit p = 0.5.',
    body: String.raw`
      <p>La frontière de décision sépare les points classés positifs des points classés
      négatifs. Pour la régression logistique, c'est l'ensemble des points où le score s'annule,
      donc où \(p = 0.5\) :</p>
      \[ w_0 + w_1 x_1 + \dots + w_d x_d = 0. \]
      <p>C'est un [[hyperplan]], donc une droite avec deux notes. Le vecteur
      \((w_1, \dots, w_d)\) lui est [[vecteur-normal|normal]], et \(w_0\) la déplace
      parallèlement à elle-même. Un modèle linéaire ne peut pas tracer de frontière courbe
      dans l'espace des notes.</p>`,
  },
  separabilite: {
    title: 'Séparabilité linéaire',
    short: 'Deux classes sont séparables quand une droite, ou un hyperplan, les sépare sans erreur.',
    body: String.raw`
      <p>Deux classes sont linéairement séparables quand un [[hyperplan]] laisse tous les points
      de l'une d'un côté et tous ceux de l'autre de l'autre côté.</p>
      <p>Le [[cout|coût]] \(J\) n'a alors pas de minimum. Multiplier par un facteur plus grand que
      1 les poids d'une frontière qui sépare tout garde les mêmes décisions, rapproche toutes
      les probabilités de 0 ou de 1, et fait donc baisser \(J\). Les poids grandissent sans fin,
      \(J\) tend vers 0 et \(\lVert \nabla J \rVert\) ne décroît qu'à peu près comme \(1/t\). La
      descente s'arrête alors sur la limite d'itérations.</p>`,
  },
  argmax: {
    title: 'argmax',
    short: 'Indice qui donne la plus grande valeur ; ici, la maison du plus grand score.',
    body: String.raw`
      <p>\(\max_h z_h\) désigne la plus grande valeur des scores, et
      \(\operatorname{arg\,max}_h z_h\) l'indice \(h\) qui la donne. Pour les scores
      \(z_G = 1.2\), \(z_P = -0.4\) et \(z_S = 0.3\), le maximum vaut 1.2 et l'argmax est
      G.</p>
      <p>En cas d'égalité, numpy et le code de la démo retiennent le premier indice.</p>`,
  },
  softplus: {
    title: 'Softplus',
    short: 'softplus(z) = ln(1 + e^z), version lisse de max(0, z).',
    body: String.raw`
      <p>La fonction softplus est</p>
      \[ \operatorname{softplus}(z) = \ln(1 + e^{z}). \]
      <p>Elle est proche de 0 pour \(z\) très négatif et de \(z\) pour \(z\) très positif. C'est
      une version lisse de \(\max(0, z)\), et sa dérivée est la [[sigmoide|sigmoïde]]. La perte
      d'un élève s'écrit \(\ell = \operatorname{softplus}(z) - y z\). Le code la calcule sous la
      forme \(\max(0, z) + \ln(1 + e^{-|z|})\), qui ne [[debordement|déborde]] pas.</p>`,
  },
  debordement: {
    title: 'Débordement',
    short: 'Résultat trop grand pour le format flottant, remplacé par l\'infini.',
    body: String.raw`
      <p>Un [[flottant|nombre flottant]] en double précision ne dépasse pas environ
      \(1.8 \times 10^{308}\). Un calcul dont le résultat est plus grand déborde et donne
      \(+\infty\). Par exemple, \(e^{710}\) vaut \(+\infty\) en double précision.</p>
      <p>À l'inverse, un résultat trop proche de 0 est arrondi à 0 (soupassement). Un
      \(+\infty\) ou un 0 intermédiaire peut ensuite produire NaN, par exemple
      \(\infty - \infty\) ou \(0 \times \infty\). Les écritures stables de la sigmoïde et de
      [[softplus]] gardent l'exposant négatif ou nul pour éviter ces cas.</p>`,
  },
  flottant: {
    title: 'Nombre flottant',
    short: 'Représentation machine d\'un réel avec un nombre fixe de chiffres significatifs.',
    body: String.raw`
      <p>Un nombre flottant représente un réel sous la forme \(\pm m \times 2^{e}\), avec une
      mantisse \(m\) et un exposant \(e\) de tailles fixes. En double précision (norme
      IEEE 754, 64 bits), la mantisse garde environ 16 chiffres décimaux significatifs, et
      l'exposant limite les valeurs absolues à l'intervalle allant d'environ \(10^{-308}\) à
      \(1.8 \times 10^{308}\).</p>
      <p>Les calculs sont donc arrondis. \(0.1 + 0.2\) ne vaut pas exactement \(0.3\), et une
      valeur hors de ces limites [[debordement|déborde]]. Python et JavaScript utilisent ce
      format pour leurs nombres réels.</p>`,
  },
};
