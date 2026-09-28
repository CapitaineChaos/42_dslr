// Contenu du cours. Une entrée = une étape = un écran.
//
// `node` rattache l'étape à un nœud du schéma de parcours ; `phase` situe le
// nœud : 'amont' avant la boucle, 'boucle' dedans, 'aval' après. Arrivé au bout
// de la boucle, suivant repart au début en incrémentant l'itération.
//
// `lead(c)` est le texte principal, concret et chiffré ; `more(c)` le détail
// mathématique, replié. Les nombres viennent de c, jamais écrits en dur.
//
// `calc` choisit les colonnes du tableau des élèves, la ligne de pied et le
// calcul déroulé pour l'élève sélectionné ; views/calc.js les interprète.

export const NODES = [
  { key: 'donnees', phase: 'amont', label: 'Données', caption: '2 notes' },
  { key: 'mediane', phase: 'amont', label: 'Médiane', caption: 'trous' },
  { key: 'echelle', phase: 'amont', label: 'Échelle', caption: '(x − μ) / σ' },
  { key: 'score', phase: 'boucle', label: 'Score', caption: 'z = wᵀx' },
  { key: 'proba', phase: 'boucle', label: 'Probabilité', caption: 'p = σ(z)' },
  { key: 'perte', phase: 'boucle', label: 'Perte', caption: 'J' },
  { key: 'gradient', phase: 'boucle', label: 'Gradient', caption: '∇J' },
  { key: 'maj', phase: 'boucle', label: 'Correction', caption: 'w − α∇J' },
  { key: 'decision', phase: 'aval', label: 'Décision', caption: 'p > 0.5' },
  { key: 'evaluation', phase: 'aval', label: 'Évaluation', caption: 'jamais vus' },
];

export const STEPS = [
  {
    id: 'donnees',
    node: 'donnees',
    phase: 'amont',
    plot: 'frontiere',
    title: "Les données",
    math: null,
    calc: { group: 'train', cols: ['name', 'y', 'raw0', 'raw1'] },
    lead: (c) => `
      <p><b>${c.n} élèves</b> servent à apprendre : ${c.positives} ${c.positive},
      ${c.negatives} ${c.negative}. Chacun n'a que deux notes, ${c.label0} et ${c.label1}.
      ${c.testCount} autres élèves sont mis de côté pour vérifier le modèle à la fin.</p>
      <p>Le modèle doit trouver, à partir des deux notes seules, si un élève est à
      ${c.positive}. C'est DSLR en petit : 2 matières au lieu de 13, 2 maisons au lieu
      de 4.</p>`,
    more: (c) => `
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
    node: 'mediane',
    phase: 'amont',
    plot: 'frontiere',
    title: "Notes manquantes",
    math: 'm_j = \\operatorname{m\\acute{e}diane}\\{x_{ij} : x_{ij} \\text{ observ\\acute{e}}\\}',
    calc: { group: 'train', cols: ['name', 'y', 'raw0', 'raw1'] },
    lead: (c) => `
      <p>Le calcul a besoin des deux notes de chaque élève. Une note manquante est remplacée
      par la <b>médiane</b> de sa matière, calculée sur les élèves d'apprentissage :
      ${c.label0} ${c.median0}, ${c.label1} ${c.median1}.</p>
      <p>Ce petit jeu n'a aucune note manquante. Dans DSLR il en manque dans presque toutes les
      matières, et Astronomy se reconstruit exactement à partir de Defense Against the Dark
      Arts.</p>`,
    more: (c) => `
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
    node: 'echelle',
    phase: 'amont',
    plot: 'frontiere',
    title: "Mise à l'échelle",
    math: 'x_{ij} \\leftarrow \\dfrac{x_{ij} - \\mu_j}{\\sigma_j}',
    calc: { group: 'train', cols: ['name', 'y', 'raw0', 'x1', 'raw1', 'x2'], worked: 'scale' },
    lead: (c) => `
      <p>${c.label0} est notée sur ${c.max0}, ${c.label1} sur ${c.max1}. Telles quelles,
      les deux colonnes n'ont pas la même échelle, et un même pas de correction serait trop
      grand pour l'une et trop petit pour l'autre.</p>
      <p>Chaque note est remplacée par son écart à la moyenne, compté en écarts types :
      <b>x = (note − μ) / σ</b>. Un élève moyen obtient 0, un élève un écart type au-dessus
      obtient 1.</p>
      <p>${c.label0} : μ = ${c.mu0}, σ = ${c.sd0}. ${c.label1} : μ = ${c.mu1},
      σ = ${c.sd1}.</p>`,
    more: (c) => `
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
  {
    id: 'score',
    node: 'score',
    phase: 'boucle',
    plot: 'scores',
    title: "Le score z",
    math: 'z_i = w_0 + w_1 x_{i1} + w_2 x_{i2} = w^{\\mathsf T} x_i',
    calc: { group: 'train', cols: ['name', 'y', 'x1', 'x2', 'z'], worked: 'z' },
    lead: (c) => `
      <p>Premier calcul du tour : chaque élève reçoit un <b>score z</b>, somme de ses deux
      notes pondérées, plus un décalage : <b>z = w₀ + w₁·x₁ + w₂·x₂</b>. Les trois poids
      w₀, w₁, w₂ sont ce que le modèle apprend.</p>
      ${c.t === 0
        ? `<p>À l'itération 0 les trois poids valent 0 : tous les scores valent 0.</p>`
        : `<p>Poids actuels : w₀ = ${c.wf[0]}, w₁ = ${c.wf[1]}, w₂ = ${c.wf[2]}.
           Les scores vont de ${c.zMin} à ${c.zMax}.</p>`}`,
    more: (c) => `
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
    node: 'score',
    phase: 'boucle',
    plot: 'frontiere',
    title: "La frontière z = 0",
    math: 'z = 0 \\iff x_2 = -\\dfrac{w_0 + w_1 x_1}{w_2}',
    calc: { group: 'train', cols: ['name', 'y', 'z', 'side'], worked: 'side' },
    lead: (c) => `
      <p>Le signe du score donne la réponse du modèle : <b>z &gt; 0 → ${c.positive}</b>,
      sinon <b>${c.negative}</b>. Dans le plan des notes, les points où z = 0 forment une
      droite : la frontière entre les deux réponses.</p>
      ${c.t === 0
        ? `<p>À l'itération 0, z vaut 0 partout : tout le monde est classé ${c.negative},
           et les ${c.positives} ${c.positive} sont en erreur.</p>`
        : `<p>À cette itération, <b>${c.errors} élèves sur ${c.n}</b> sont du mauvais côté,
           cerclés sur la figure.</p>`}`,
    more: (c) => `
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
    node: 'proba',
    phase: 'boucle',
    plot: 'sigmoide',
    title: "Du score à la probabilité",
    math: 'p_i = \\sigma(z_i) = \\dfrac{1}{1 + e^{-z_i}}',
    calc: { group: 'train', cols: ['name', 'y', 'z', 'p'], worked: 'p' },
    lead: (c) => `
      <p>Un score peut valoir n'importe quoi, de −∞ à +∞. La <b>sigmoïde σ</b> le transforme
      en probabilité d'être à ${c.positive}, entre 0 et 1 : z = 0 donne 0.5, z = 3 donne
      0.95, z = −3 donne 0.05.</p>
      <p>Probabilités actuelles : de ${c.pMin} à ${c.pMax}.</p>`,
    more: (c) => `
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
    node: 'proba',
    phase: 'boucle',
    plot: 'sigmoide',
    widget: 'overflow',
    title: "Éviter le débordement",
    math: '\\sigma(z) = \\begin{cases} 1/(1+e^{-z}) & z \\geq 0 \\\\ e^{z}/(1+e^{z}) & z < 0\\end{cases}',
    calc: null,
    lead: () => `
      <p>Un nombre à virgule ne dépasse pas 1.8 × 10³⁰⁸. Or e<sup>z</sup> franchit cette limite
      dès que z dépasse 709.8 : écrite telle quelle, la sigmoïde casse pour un score très
      négatif.</p>
      <p>Le code écrit σ de deux façons égales et prend, selon le signe de z, celle dont
      l'exponentielle reste petite. Le curseur fait varier z : au-delà de ±710, l'écriture
      directe donne 0, ∞ ou NaN, celle du code reste juste.</p>`,
    more: () => `
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
    node: 'proba',
    phase: 'boucle',
    plot: 'surface',
    title: "La surface de probabilité",
    math: 'p(x_1, x_2) = \\sigma(w_0 + w_1 x_1 + w_2 x_2)',
    calc: { group: 'train', cols: ['name', 'y', 'x1', 'x2', 'p'], worked: 'p' },
    lead: (c) => `
      <p>La probabilité existe en tout point du plan des notes, pas seulement pour les
      ${c.n} élèves : c'est une surface en S posée au-dessus du plan. Elle vaut 0.5 sur la
      frontière, tend vers 1 côté ${c.positive} et vers 0 côté ${c.negative}.</p>
      <p>Plus les poids sont grands, plus la pente est raide et plus le modèle est tranché.
      ${c.t === 0 ? "À l'itération 0 la surface est plate, à 0.5 partout."
                  : `Pente maximale : ${c.slope}.`}</p>`,
    more: (c) => `
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
    node: 'perte',
    phase: 'boucle',
    plot: 'perte',
    title: "La perte d'un élève",
    math: '\\ell_i = -y_i\\ln p_i - (1-y_i)\\ln(1-p_i) = \\operatorname{softplus}(z_i) - y_i z_i',
    calc: { group: 'train', cols: ['name', 'y', 'p', 'loss'], worked: 'loss' },
    lead: (c) => `
      <p>Pour mesurer l'erreur sur un élève, on prend la probabilité que le modèle donne à sa
      <b>vraie</b> maison, et on en prend le logarithme :
      <b>ℓ = −ln(p)</b> pour un ${c.positive}, <b>ℓ = −ln(1 − p)</b> pour un
      ${c.negative}.</p>
      <p>Vraie maison jugée certaine : ℓ proche de 0. Jugée impossible : ℓ très grand. Un
      élève mal classé avec aplomb coûte beaucoup plus cher qu'un élève mal classé de
      justesse.</p>`,
    more: () => `
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
    node: 'perte',
    phase: 'boucle',
    plot: 'perte',
    title: "La perte du modèle J",
    math: 'J(w) = \\dfrac{1}{n}\\sum_{i=1}^{n} \\ell_i(w)',
    calc: { group: 'train', cols: ['name', 'y', 'p', 'loss'], footer: 'J', worked: 'J' },
    lead: (c) => `
      <p>La perte du modèle, <b>J</b>, est la moyenne des ${c.n} pertes :
      <b>J = ${c.cost}</b>. C'est le seul nombre que l'entraînement cherche à faire
      baisser.</p>
      <p>${c.t === 0
        ? 'Au départ toutes les probabilités valent 0.5, donc J = −ln(0.5) = ln 2 ≈ 0.693.'
        : `Au départ J valait ${c.costStart} ; à l'arrêt il vaudra ${c.costEnd}.`}
      J ne descend jamais à 0 : quelques élèves sont dans la zone où les deux maisons se
      mélangent.</p>`,
    more: (c) => `
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
    node: 'gradient',
    phase: 'boucle',
    plot: 'chemin',
    title: "L'erreur de chaque élève",
    math: '\\dfrac{\\partial \\ell_i}{\\partial z_i} = \\sigma(z_i) - y_i = p_i - y_i',
    calc: { group: 'train', cols: ['name', 'y', 'p', 'err'], worked: 'err' },
    lead: (c) => `
      <p>Pour corriger les poids, il faut savoir dans quel sens chaque élève tire. Ça tient en
      une soustraction : <b>erreur = p − y</b>, avec y = 1 pour un ${c.positive} et y = 0
      pour un ${c.negative}.</p>
      <p>Erreur négative : le score de l'élève doit monter. Positive : il doit baisser.
      Proche de 0 : l'élève est bien classé avec assurance et ne demande presque rien.</p>`,
    more: (c) => `
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
    node: 'gradient',
    phase: 'boucle',
    plot: 'chemin',
    title: "Le gradient",
    math: '\\nabla J(w) = \\dfrac{1}{n} X^{\\mathsf T}(p - y)',
    calc: { group: 'train', cols: ['name', 'err', 'x1', 'x2', 'c0', 'c1', 'c2'], footer: 'grad', worked: 'contrib' },
    lead: (c) => `
      <p>L'erreur de chaque élève est multipliée par ses entrées (1, x₁, x₂) : on obtient sa
      <b>contribution</b> à la correction de w₀, w₁ et w₂. Un élève aux notes extrêmes pèse
      plus lourd sur le poids de cette matière.</p>
      <p>On additionne les ${c.n} contributions colonne par colonne, puis on divise par
      ${c.n} : c'est le <b>gradient</b>, ∇J = (${c.gf.join(' ; ')}). Il pointe vers
      l'endroit où J augmente.</p>`,
    more: (c) => `
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
    node: 'maj',
    phase: 'boucle',
    plot: 'chemin',
    title: "La correction des poids",
    math: 'w^{(t+1)} = w^{(t)} - \\alpha\\,\\nabla J(w^{(t)})',
    calc: { group: 'train', cols: ['name', 'y', 'c0', 'c1', 'c2'], footer: 'update', worked: 'update' },
    lead: (c) => `
      <p>La correction : on retire à chaque poids <b>α fois son gradient</b>, avec
      α = ${c.alpha}. Aller à l'opposé du gradient fait baisser J.</p>
      ${c.t === c.last
        ? `<p>C'est la dernière itération : le critère d'arrêt est atteint, les poids ne
           bougent plus.</p>`
        : `<p>w₀ : ${c.wf[0]} → ${c.wnf[0]}<br>w₁ : ${c.wf[1]} → ${c.wnf[1]}<br>
           w₂ : ${c.wf[2]} → ${c.wnf[2]}</p>
           <p>Avec ces nouveaux poids, le tour recommence au score : c'est l'itération
           ${c.t + 1}.</p>`}`,
    more: (c) => `
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
    node: 'maj',
    phase: 'boucle',
    plot: 'perte',
    title: "Le critère d'arrêt",
    math: '\\dfrac{|J(w^{(t-1)}) - J(w^{(t)})|}{\\max(1, |J(w^{(t)})|)} < \\varepsilon',
    calc: { group: null, cols: null, worked: 'stop' },
    lead: (c) => `
      <p>La boucle s'arrête quand J ne baisse presque plus, c'est-à-dire quand sa variation
      relative d'un tour à l'autre passe sous 10⁻⁶.</p>
      <p>${c.t === 0
        ? "À l'itération 0 il n'y a pas encore de tour précédent : la boucle continue."
        : c.t < c.last
          ? `Ici J est passé de ${c.costPrev} à ${c.cost} : variation ${c.relativePrev},
             la boucle continue.`
          : `À l'itération ${c.last} la variation tombe à ${c.relativePrev}, sous le seuil :
             la boucle s'arrête.`}
      Sur ce jeu, l'arrêt tombe à l'itération ${c.last}${c.converged ? ''
        : ", limite d'itérations atteinte"}.</p>`,
    more: (c) => `
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
  {
    id: 'decision',
    node: 'decision',
    phase: 'aval',
    plot: 'roc',
    title: "La décision",
    math: '\\hat{y}_i = \\mathbf{1}[\\,p_i > \\tau\\,]',
    calc: { group: 'train', cols: ['name', 'y', 'p', 'pred', 'case'], footer: 'confusion', worked: 'case' },
    lead: (c) => `
      <p>Les poids sont figés. Pour chaque élève : <b>p &gt; 0.5 → ${c.positive}</b>, sinon
      ${c.negative}. Chaque réponse tombe dans une des quatre cases :
      <b>VP</b> ${c.positive} reconnu, <b>FN</b> ${c.positive} manqué,
      <b>FP</b> ${c.negative} pris pour un ${c.positive}, <b>VN</b> ${c.negative}
      reconnu.</p>
      <p>Exactitude ${c.accuracy} % : ${c.n - c.errors} bonnes réponses sur ${c.n}.</p>`,
    more: (c) => `
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
    node: 'decision',
    phase: 'aval',
    plot: 'frontiere',
    title: "Les élèves mal classés",
    math: null,
    calc: { group: 'train', cols: ['name', 'y', 'x1', 'x2', 'p', 'case'] },
    lead: (c) => `
      <p><b>${c.errors} élèves</b> restent mal classés. Ils sont dans la zone où les notes des
      deux maisons se recouvrent : aucune droite ne peut les mettre tous du bon côté sans en
      faire basculer d'autres.</p>`,
    more: (c) => `
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
    node: 'evaluation',
    phase: 'aval',
    plot: 'perte',
    title: "Les élèves jamais vus",
    math: null,
    calc: { group: 'test', cols: ['name', 'y', 'raw0', 'raw1', 'x1', 'x2', 'p', 'case'], worked: 'case' },
    lead: (c) => `
      <p>Les ${c.testCount} élèves mis de côté n'ont servi à rien pendant l'apprentissage. On
      leur applique exactement les mêmes μ, σ et poids :
      <b>${c.testCount - c.testErrors} sur ${c.testCount}</b> sont bien classés.</p>
      <p>C'est ce que fait logreg_predict.py avec weights.csv sur dataset_test.csv.</p>`,
    more: (c) => `
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
    node: 'evaluation',
    phase: 'aval',
    plot: 'perte',
    title: "Vers les quatre maisons",
    math: null,
    calc: null,
    lead: (c) => `
      <p>DSLR fait la même chose avec 4 maisons et 10 matières : un modèle par maison,
      entraîné à la reconnaître contre les trois autres (one-vs-all).</p>
      <p>Pour un élève, chacun des 4 modèles donne sa probabilité, et on garde la maison la
      plus probable. logreg_train.py fait les 4 descentes, logreg_predict.py le choix.</p>`,
    more: (c) => `
      <p>Sur ${c.testCount} observations, une erreur de plus ou de moins déplace le taux de
      ${(100 / c.testCount).toFixed(0)} points. L'intervalle de confiance couvre presque tout
      l'intervalle unité : l'écart entre taux d'apprentissage et taux d'évaluation reste dans
      le bruit d'échantillonnage.</p>
      <p>Ce jeu a pour objet de rendre chaque calcul vérifiable à la main. Sur les 1600 élèves
      de DSLR, les mêmes estimateurs donnent des taux dont la précision autorise une
      comparaison.</p>
      <p>logreg_predict.py lit le modèle enregistré, applique les mêmes transformations,
      calcule quatre probabilités et retient la plus grande.</p>`,
  },
];
