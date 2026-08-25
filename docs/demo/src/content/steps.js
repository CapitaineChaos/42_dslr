// Contenu du cours. Une entrée = une micro-étape = un écran.
//
// `phase` situe la micro-étape : 'amont' avant la boucle, 'boucle' dedans,
// 'aval' après. La navigation se charge du reste : arrivé au bout de la boucle,
// suivant repart au début en incrémentant l'itération.
//
// `prose(ctx)` reçoit tout ce qui dépend de l'itération courante. Les nombres
// ne sont jamais écrits en dur : ils viennent de ctx.

export const STEPS = [

  /* ------------------------------------------------------------- amont */

  {
    id: 'donnees',
    section: 'Prétraitement',
    phase: 'amont',
    plot: 'frontiere',
    title: 'Données et partition',
    math: null,
    prose: (c) => `
      <p>Chaque élève est décrit par deux notes, ${c.stats[c.courses[0]].label} et
      ${c.stats[c.courses[1]].label}, et par une maison observée. Le modèle estime la
      probabilité d'appartenance à ${c.positive} à partir de ces deux variables.</p>
      <p>Le groupe d'apprentissage compte <b>n = ${c.n}</b> élèves, dont <b>${c.positives}</b>
      ${c.positive}. ${c.testCount} élèves constituent le groupe d'évaluation. Médianes,
      moyennes, écarts types et coefficients sont estimés sur le seul groupe
      d'apprentissage.</p>
      <p>Le problème est binaire : ${c.positive} contre ${c.negative}. Sur les quatre maisons
      de DSLR, quatre modèles de cette forme sont ajustés et la maison retenue est celle de
      probabilité maximale.</p>`,
  },

  {
    id: 'imputation',
    section: 'Prétraitement',
    phase: 'amont',
    plot: 'frontiere',
    title: 'Imputation par la médiane',
    math: 'm_j = \\operatorname{m\\acute{e}diane}\\{x_{ij} : x_{ij} \\text{ observ\\acute{e}}\\}',
    prose: (c) => `
      <p>Le score requiert deux valeurs numériques par ligne. Une valeur manquante est
      remplacée par la médiane de sa colonne, estimée sur les valeurs observées du groupe
      d'apprentissage.</p>
      <p>La médiane est retenue pour sa robustesse : une valeur extrême déplace la moyenne
      proportionnellement à son écart, la médiane d'un rang au plus.</p>
      <span class="now">${c.courses.map((k) =>
        `<b>${c.stats[k].label}</b> m = ${c.stats[k].median}`).join('<br>')}</span>
      <p>Dans le jeu complet de DSLR, la colonne Astronomie vaut -100 × Défense contre les
      forces du Mal ; une valeur manquante d'Astronomie se déduit de cette relation
      exacte.</p>`,
  },

  {
    id: 'standardisation',
    section: 'Prétraitement',
    phase: 'amont',
    plot: 'frontiere',
    title: 'Centrage et réduction',
    math: 'x_{ij} \\leftarrow \\dfrac{x_{ij} - \\mu_j}{\\sigma_j}',
    prose: (c) => `
      <p>${c.stats[c.courses[0]].label} est notée sur ${c.stats[c.courses[0]].max},
      ${c.stats[c.courses[1]].label} sur ${c.stats[c.courses[1]].max}. Les deux colonnes ont
      des variances d'ordres de grandeur différents, et les coefficients <code>w₁</code> et
      <code>w₂</code> s'expriment dans des unités incomparables.</p>
      <p>La conséquence porte sur l'optimisation : la hessienne de <code>J</code> est mal
      conditionnée, ses lignes de niveau sont des ellipses allongées, et un pas
      <code>α</code> unique convient à une seule direction. Après centrage et réduction, les
      deux directions ont la même échelle.</p>
      <span class="now">${c.courses.map((k) =>
        `<b>${c.stats[k].label}</b> μ = ${c.stats[k].mu}, σ = ${c.stats[k].sd}`).join('<br>')}</span>
      <p>Ces quatre valeurs sont enregistrées avec le modèle. La prédiction applique les
      mêmes, estimées sur le groupe d'apprentissage.</p>
      ${c.raw ? `
      <p><strong>Mode notes brutes.</strong> Les notes entrent sans transformation, à
      <code>α</code>, code et critère d'arrêt identiques. La perte se compte en dizaines, la
      norme des coefficients en centaines, et la descente atteint la limite d'itérations. Un
      pas adapté à ${c.stats[c.courses[0]].label} vaut ${Math.round(c.stats[c.courses[1]].sd / c.stats[c.courses[0]].sd)} fois
      l'échelle utile pour ${c.stats[c.courses[1]].label}.</p>`
: ''}`,
  },

  /* ------------------------------------------------------------ boucle */

  {
    id: 'score',
    section: 'Score',
    phase: 'boucle',
    plot: 'scores',
    title: 'Combinaison linéaire',
    math: 'z_i = w_0 + w_1 x_{i1} + w_2 x_{i2} = w^{\\mathsf T} x_i',
    prose: (c) => `
      <p>La décision porte sur un scalaire, que la forme linéaire <code>wᵀx</code> produit à
      partir des deux notes. Chaque coefficient est la contribution marginale de sa variable au
      score : sa valeur donne l'amplitude, son signe le sens.</p>
      <p><code>w₀</code> multiplie la colonne constante placée en tête de chaque ligne. Le
      terme constant devient un coefficient parmi les autres et la boucle d'accumulation
      traite les trois colonnes de façon uniforme.</p>
      <p>Les ${c.n} élèves se rangent alors sur une droite graduée, chacun à son score, et la
      décision ne lit que le signe. La distance de l'un d'eux à la graduation 0 vaut
      <code>‖(w₁, w₂)‖</code> fois sa distance à la frontière dans le plan des notes.</p>
      ${c.t === 0 ? `
        <p><strong>Itération 0.</strong> <code>w = (0, 0, 0)</code>, valeur initiale du code,
        donc <code>z = 0</code> pour les ${c.n} élèves et en tout point du plan.</p>`
      : `
        <span class="now"><b>w = ${c.wText}</b><br>
        z de ${c.zMin} à ${c.zMax}</span>`}`,
  },

  {
    id: 'frontiere',
    section: 'Score',
    phase: 'boucle',
    plot: 'frontiere',
    title: 'Frontière z = 0',
    math: 'z = 0 \\iff x_2 = -\\dfrac{w_0 + w_1 x_1}{w_2}',
    prose: (c) => `
      <p>L'ensemble <code>{z = 0}</code> est une droite affine de ℝ², et le signe de
      <code>z</code> partage le plan en deux demi-plans. Décider par le signe du score revient
      donc à affecter une maison à chaque demi-plan.</p>
      <p><code>(w₁, w₂)</code> est le vecteur normal à cette droite : il fixe sa direction.
      <code>w₀</code> fixe sa position à direction constante, la translation valant
      <code>-w₀/‖(w₁, w₂)‖</code> le long de la normale.</p>
      ${c.t === 0 ? `
        <p><strong>Itération 0.</strong> L'équation <code>z = 0</code> est vérifiée en tout
        point du plan : aucune droite n'est définie.</p>`
      : `
        <span class="now"><b>${c.errors} erreurs sur ${c.n}</b>, cerclées sur la figure :
        leur score les place dans le demi-plan opposé à leur étiquette</span>`}`,
  },

  {
    id: 'logistique',
    section: 'Probabilité',
    phase: 'boucle',
    plot: 'sigmoide',
    title: 'Fonction logistique σ',
    math: 'p_i = \\sigma(z_i) = \\dfrac{1}{1 + e^{-z_i}}',
    prose: (c) => `
      <p>L'étiquette <code>y</code> prend ses valeurs dans <code>{0, 1}</code> et
      <code>z</code> décrit ℝ. Leur comparaison passe par une bijection croissante de ℝ dans
      <code>]0, 1[</code> ; σ en est une.</p>
      <p>σ est strictement croissante, donc elle conserve l'ordre des scores, et
      <code>σ(z) ≥ ½</code> équivaut à <code>z ≥ 0</code> : la frontière reste la droite
      précédente.</p>
      <span class="now"><b>p</b> de ${c.pMin} à ${c.pMax}${
        c.t === 0 ? ', soit σ(0) = ½ pour les ' + c.n + ' élèves' : ''}</span>
      <p>L'écriture <code>1/(1+exp(-z))</code> déborde pour <code>z</code> très négatif. Le
      code sélectionne, selon le signe de <code>z</code>, celle des deux écritures dont
      l'exposant reste négatif ou nul.</p>`,
  },

  {
    id: 'stabilite',
    section: 'Probabilité',
    phase: 'boucle',
    plot: 'sigmoide',
    widget: 'overflow',
    title: 'Stabilité numérique',
    math: '\\sigma(z) = \\begin{cases} 1/(1+e^{-z}) & z \\geq 0 \\\\ e^{z}/(1+e^{z}) & z < 0\\end{cases}',
    prose: () => `
      <p>Un flottant double code au plus <code>1,798 × 10³⁰⁸</code>. <code>exp(z)</code>
      dépasse cette borne pour <code>z > 709,78</code> : au-delà, <code>exp(-z)</code> avec
      <code>z</code> négatif cesse d'être représentable.</p>
      <p>Les deux branches sélectionnent l'écriture dont l'exposant reste négatif ou nul.
      Elles sont égales en arithmétique exacte et diffèrent par leur comportement en
      arithmétique flottante.</p>
      <p>La perte suit la même contrainte : <code>ln(1+e^z)</code> déborde pour
      <code>z</code> grand, alors que <code>max(0,z) + ln(1+e^{-|z|})</code> reste défini et
      vaut <code>z + o(1)</code>.</p>
`,
  },

  {
    id: 'surface',
    section: 'Probabilité',
    phase: 'boucle',
    plot: 'surface',
    title: 'Surface de probabilité',
    math: 'p(x_1, x_2) = \\sigma(w_0 + w_1 x_1 + w_2 x_2)',
    prose: (c) => `
      <p>La composée de σ et de la forme linéaire définit une surface au-dessus du plan des
      notes. Sa ligne de niveau <code>½</code> se projette exactement sur la frontière tracée
      à l'étape précédente.</p>
      <p>Toutes ces surfaces se déduisent d'une même sigmoïde unidimensionnelle par le
      changement de variable <code>z = wᵀx</code>. La direction de plus forte variation est
      <code>(w₁, w₂)</code> et la pente maximale vaut <code>‖(w₁, w₂)‖ / 4</code>, puisque
      <code>σ′(0) = ¼</code>.</p>
      ${c.t === 0 ? `
        <p><strong>Itération 0.</strong> La surface est constante et vaut <code>½</code> : la
        pente maximale est nulle, conformément à <code>‖(0, 0)‖ / 4</code>.</p>`
      : `
        <span class="now">direction de plus forte variation
        <b>(${c.w[1].toFixed(3)}, ${c.w[2].toFixed(3)})</b><br>
        pente maximale ${(Math.hypot(c.w[1], c.w[2]) / 4).toFixed(3)}</span>`}`,
  },

  {
    id: 'perte-observation',
    section: 'Perte',
    phase: 'boucle',
    plot: 'perte',
    title: 'Perte d\'une observation',
    math: '\\ell_i = -y_i\\ln p_i - (1-y_i)\\ln(1-p_i) = \\operatorname{softplus}(z_i) - y_i z_i',
    prose: () => `
      <p>L'entropie croisée binaire tend vers 0 quand <code>p</code> tend vers <code>y</code>,
      croît avec l'écart, et tend vers <code>+∞</code> quand <code>p</code> tend vers l'étiquette
      opposée. Elle reste strictement positive, puisque <code>σ</code> prend ses valeurs dans
      l'ouvert <code>]0, 1[</code>. Elle est convexe en <code>z</code>.</p>
      <p>L'étiquette annule l'un des deux termes. Le développement des deux cas donne
      <code>ℓ = ln(1+e^z) - yz</code>, forme retenue dans le code : elle n'évalue le
      logarithme qu'en un argument supérieur ou égal à 1.</p>
      <p><code>softplus</code> désigne <code>ln(1+e^z)</code>, évaluée sous la forme stable
      <code>max(0,z) + ln(1+e^{-|z|})</code>.</p>`,
  },

  {
    id: 'risque',
    section: 'Perte',
    phase: 'boucle',
    plot: 'perte',
    title: 'Risque empirique',
    math: 'J(w) = \\dfrac{1}{n}\\sum_{i=1}^{n} \\ell_i(w)',
    prose: (c) => `
      <p>Les notes et les étiquettes sont fixées : <code>J</code> est une fonction de
      <code>w</code> seul, convexe et de classe <code>C^∞</code>. Comparer deux vecteurs de
      coefficients revient à comparer deux réels.</p>
      <span class="now"><b>J = ${c.cost}</b>${
        c.t === 0 ? ' = ln 2, puisque σ(0) = ½ pour toutes les observations'
                  : ` &nbsp; J(0) = ${c.costStart}, borne atteinte ${c.costEnd}`}</span>
      <p>La borne inférieure atteinte est strictement positive : ${c.finalErrors} élèves se
      situent dans la zone de recouvrement des deux maisons, et aucun vecteur de coefficients
      ne satisfait simultanément ces observations et leurs voisines.</p>
      <p>L'objectif minimisé est <code>J</code>, et non le nombre d'erreurs : ce dernier est
      constant par morceaux, donc de dérivée nulle presque partout et sans direction de
      descente.</p>
      <p>Les deux quantités évoluent à des rythmes différents. <code>J</code> décroît à chaque
      pas ; le nombre d'erreurs reste constant sur des dizaines d'itérations puis varie d'une
      unité au franchissement de la frontière par un élève. Il peut croître : la descente
      réduit parfois la perte de deux observations très mal classées au prix du basculement
      d'une troisième.</p>`,
  },

  {
    id: 'derivee',
    section: 'Gradient',
    phase: 'boucle',
    plot: 'chemin',
    title: 'Dérivée par rapport au score',
    math: '\\dfrac{\\partial \\ell_i}{\\partial z_i} = \\sigma(z_i) - y_i = p_i - y_i',
    prose: (c) => `
      <p>La dérivation utilise <code>σ′ = σ(1-σ)</code> : le logarithme et l'exponentielle se
      simplifient, et la dérivée de la perte d'une observation par rapport à son score se
      réduit à l'écart entre probabilité estimée et étiquette observée.</p>
      <p>Une observation classée conformément à son étiquette avec une probabilité proche de
      1 a un écart de module proche de 0 et une contribution négligeable. Une observation
      classée à l'opposé de son étiquette a un écart de module proche de 1 et domine la
      somme.</p>
      ${c.t === 0 ? `
        <p><strong>Itération 0.</strong> Tous les <code>p</code> valent <code>½</code>, donc
        chaque écart vaut <code>½ - y</code> : <code>-½</code> pour un ${c.positive},
        <code>+½</code> sinon. Leur somme se réduit au comptage
        <code>${c.n / 2} - ${c.positives}</code>.</p>` : ''}`,
  },

  {
    id: 'gradient',
    section: 'Gradient',
    phase: 'boucle',
    plot: 'chemin',
    title: 'Gradient',
    math: '\\nabla J(w) = \\dfrac{1}{n} X^{\\mathsf T}(p - y)',
    prose: (c) => `
      <p>La règle de dérivation des fonctions composées reporte l'écart sur chaque colonne de
      la ligne : une observation contribue proportionnellement à son écart et à ses propres
      variables. Le gradient a la dimension de <code>w</code>, ce qui autorise la soustraction
      directe.</p>
      <p>L'implémentation se réduit à un produit matrice-vecteur, une soustraction et une
      division par <code>n</code>.</p>
      <span class="now"><b>∇J = ${c.gradText}</b><br>‖∇J‖ = ${c.gradNorm}</span>
      <p><code>‖∇J‖</code> tend vers 0 au voisinage du minimum, donc la longueur du pas
      <code>α‖∇J‖</code> décroît à <code>α</code> constant.</p>`,
  },

  {
    id: 'pas',
    section: 'Mise à jour',
    phase: 'boucle',
    plot: 'chemin',
    title: 'Pas de descente',
    math: 'w^{(t+1)} = w^{(t)} - \\alpha\\,\\nabla J(w^{(t)})',
    prose: (c) => `
      <p>Le gradient donne la direction de plus forte croissance de <code>J</code>. Le
      déplacement s'effectue dans la direction opposée, de longueur <code>α‖∇J‖</code> avec
      <code>α = ${c.alpha}</code>. La figure Trajectoire superpose la suite des coefficients
      aux lignes de niveau de <code>J</code>.</p>
      <span class="now">
        <b>w<sup>(t)</sup></b> ${c.wText}<br>
        <b>-α∇J</b> ${c.stepText}<br>
        <b>w<sup>(t+1)</sup></b> ${c.wNextText}
      </span>
      <p>Pour <code>J</code> convexe de gradient <code>L</code>-lipschitzien, la convergence
      est garantie tant que <code>α < 2/L</code>. Au-delà, la suite des pertes diverge ; le
      code teste la finitude de la perte et interrompt l'ajustement en demandant un
      <code>α</code> plus petit.</p>`,
  },

  {
    id: 'arret',
    section: 'Mise à jour',
    phase: 'boucle',
    plot: 'perte',
    title: 'Critère d\'arrêt',
    math: '\\dfrac{|J(w^{(t-1)}) - J(w^{(t)})|}{\\max(1, |J(w^{(t)})|)} < \\varepsilon',
    prose: (c) => `
      <p>Une itération comprend le calcul des scores, des probabilités, de la perte, du
      gradient, puis la mise à jour. Les coefficients ayant changé, les quatre premières
      quantités sont recalculées au tour suivant.</p>
      <p>Le critère porte sur la variation relative de la perte, normalisée par
      <code>max(1, |J|)</code> pour rester homogène quel que soit l'ordre de grandeur de
      <code>J</code>. Les deux valeurs comparées sont évaluées avant la mise à jour, donc pour
      deux vecteurs de coefficients consécutifs et pour eux seuls.</p>
      <span class="now">
        <b>itération ${c.t}</b> sur ${c.last}${c.converged ? ", critère atteint à l'arrêt" : ", limite d'itérations"}<br>
        J passe de ${c.cost} à ${c.costNext}<br>
        variation relative ${c.relative}
      </span>
      ${c.converged ? '' : `
      <p>Sur ce réglage, la descente s'arrête sur la limite de ${c.last + 1} itérations, la
      perte décroissant encore. Les deux groupes étant presque séparables, la norme des
      coefficients croît sans borne et la pente maximale de la surface avec elle.</p>`}
`,
  },

  /* -------------------------------------------------------------- aval */

  {
    id: 'decision',
    section: 'Décision',
    phase: 'aval',
    plot: 'roc',
    title: 'Règle de décision',
    math: '\\hat{y}_i = \\mathbf{1}[\\,p_i \\geq \\tau\\,]',
    prose: (c) => `
      <p>Le seuil s'applique après l'ajustement, sur des probabilités déjà calculées, et
      laisse les coefficients inchangés. À <code>τ = ½</code>, la règle coïncide avec le signe
      de <code>z</code>, donc avec la frontière.</p>
      <p>Un seuil supérieur à <code>½</code> translate la frontière parallèlement à
      elle-même, de <code>ln(τ/(1-τ)) / ‖(w₁, w₂)‖</code> le long de la normale, et laisse sa
      direction inchangée.</p>
      <span class="now">
        <b>VP ${c.tp}, FP ${c.fp}, FN ${c.fn}, VN ${c.tn}</b><br>
        exactitude ${c.accuracy} % &nbsp;
        précision ${c.precision === null ? 'indéfinie' : c.precision + ' %'} &nbsp;
        rappel ${c.recall === null ? 'indéfini' : c.recall + ' %'}
      </span>
      <p>L'exactitude est la proportion de décisions correctes. La précision,
      <code>VP/(VP+FP)</code>, est la proportion de ${c.positive} parmi les élèves classés
      ${c.positive}. Le rappel, <code>VP/(VP+FN)</code>, est la proportion de ${c.positive}
      retrouvés parmi les ${c.positive} observés.</p>
      ${c.precision === null ? `
      <p><strong>Itération 0.</strong> La règle exige <code>z > 0</code> et tous les scores
      sont nuls : <code>VP + FP = 0</code>, le dénominateur de la précision est nul et la
      quantité est indéfinie. Une division sans test renverrait ici une erreur.</p>` : ''}
      <p>Balayer <code>τ</code> de 1 à 0 décrit la courbe ROC : chaque seuil donne un couple
      (taux de faux positifs, taux de vrais positifs). Son aire vaut la probabilité qu'un
      ${c.positive} tiré au hasard reçoive un score supérieur à celui d'un ${c.negative} tiré au
      hasard, et vaut ½ pour un classement sans information.</p>
      <p>Sur les quatre maisons de DSLR, la décision porte sur quatre probabilités et retient
      la plus grande ; aucun seuil n'y intervient.</p>`,
  },

  {
    id: 'erreurs',
    section: 'Décision',
    phase: 'aval',
    plot: 'frontiere',
    title: 'Observations mal classées',
    math: null,
    prose: (c) => `
      <p>Les élèves cerclés ont un score dont le signe contredit leur étiquette. Leurs
      positions se concentrent dans la zone où les deux maisons se recouvrent.</p>
      <p>Aucun vecteur de coefficients ne les classe tous correctement : c'est la traduction
      géométrique de la borne inférieure strictement positive de <code>J</code>. Une frontière
      qui les placerait du bon côté ferait passer leurs voisins immédiats du mauvais.</p>
      <span class="now"><b>${c.errors} erreurs</b> à l'itération ${c.t},
      ${c.finalErrors} à l'arrêt</span>`,
  },

  {
    id: 'evaluation',
    section: 'Évaluation',
    phase: 'aval',
    plot: 'perte',
    title: 'Groupe d\'évaluation',
    math: null,
    prose: (c) => `
      <p>Les ${c.testCount} élèves d'évaluation sont exclus de l'estimation des médianes, des
      moyennes, des écarts types et des coefficients. Le taux mesuré sur ce groupe porte donc
      sur des observations extérieures à l'ajustement.</p>
      <span class="now">
        <b>apprentissage</b> ${c.n - c.errors} / ${c.n} corrects<br>
        <b>évaluation</b> ${c.testCount - c.testErrors} / ${c.testCount} corrects
      </span>
      <p>Le modèle enregistré contient les médianes, les moyennes, les écarts types et les
      coefficients. La prédiction applique les mêmes transformations, avec les mêmes
      constantes, sous peine de coefficients appliqués à des variables d'une autre
      échelle.</p>`,
  },

  {
    id: 'portee',
    section: 'Évaluation',
    phase: 'aval',
    plot: 'perte',
    title: 'Portée statistique',
    math: null,
    prose: (c) => `
      <p>Sur ${c.testCount} observations, une erreur de plus ou de moins déplace le taux de
      ${(100 / c.testCount).toFixed(0)} points. L'intervalle de confiance couvre presque tout
      l'intervalle unité : l'écart entre taux d'apprentissage et taux d'évaluation reste dans
      le bruit d'échantillonnage.</p>
      <p>Ce jeu a pour objet de rendre chaque calcul vérifiable à la main. Sur les 1600 élèves
      de DSLR, les mêmes estimateurs donnent des taux dont la précision autorise une
      comparaison.</p>
      <p>La prédiction reste à écrire : lecture du modèle enregistré, application des mêmes
      transformations, calcul de quatre probabilités et sélection du maximum.</p>`,
  },

];
