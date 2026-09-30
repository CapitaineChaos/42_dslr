export const STATISTIQUE = {
  mediane: {
    title: 'Médiane',
    short: 'Valeur qui partage les données triées en deux moitiés.',
    body: String.raw`
      <p>La médiane d'une liste de \(n\) valeurs se lit sur la liste triée
      \(x_{(1)} \le \dots \le x_{(n)}\) :</p>
      \[ m = \begin{cases} x_{((n+1)/2)} & \text{si } n \text{ est impair} \\
         \tfrac{1}{2}\big(x_{(n/2)} + x_{(n/2+1)}\big) & \text{si } n \text{ est pair.} \end{cases} \]
      <p>Pour les notes 4, 9, 11, 12 et 20, la médiane vaut 11. Remplacer 20 par 100 ne la
      change pas, alors que la [[moyenne]] passe de 11.2 à 27.2. La médiane ne dépend que de
      l'ordre des valeurs, ce qui la rend peu sensible aux valeurs extrêmes.</p>`,
  },
  moyenne: {
    title: 'Moyenne',
    short: 'Somme des valeurs divisée par leur nombre.',
    body: String.raw`
      <p>La moyenne de \(n\) valeurs est</p>
      \[ \mu = \frac{1}{n}\sum_{i=1}^{n} x_i. \]
      <p>C'est le point d'équilibre des valeurs, au sens où la somme des écarts \(x_i - \mu\)
      est nulle. Une seule valeur extrême la déplace en proportion de son écart, contrairement
      à la [[mediane|médiane]].</p>`,
  },
  'ecart-type': {
    title: 'Écart type',
    short: 'Dispersion des valeurs autour de leur moyenne, exprimée dans leur unité.',
    body: String.raw`
      <p>L'écart type mesure la dispersion des valeurs autour de leur [[moyenne]] :</p>
      \[ \sigma = \sqrt{\frac{1}{n}\sum_{i=1}^{n} (x_i - \mu)^2}. \]
      <p>Il s'exprime dans l'unité des valeurs. Des notes sur 20 qui s'écartent d'environ 5
      points de leur moyenne ont un écart type de l'ordre de 5. La division par \(n\) donne
      l'écart type de la population, celui de dslr. La division par \(n - 1\) donne
      l'estimateur corrigé, un peu plus grand pour les petits échantillons.</p>`,
  },
  standardisation: {
    title: 'Standardisation',
    short: 'Transformation (x − μ) / σ qui donne à une variable une moyenne nulle et un écart type de 1.',
    body: String.raw`
      <p>Standardiser une variable consiste à lui retrancher sa [[moyenne]] et à la diviser par
      son [[ecart-type|écart type]] :</p>
      \[ x' = \frac{x - \mu}{\sigma}. \]
      <p>La variable obtenue a une moyenne nulle et un écart type de 1, sans unité. Une note
      standardisée de +1.5 est à un écart type et demi au-dessus de la moyenne de sa matière.
      Les poids deviennent comparables d'une matière à l'autre, et le
      [[conditionnement]] de \(J\) s'améliore.</p>
      <p>\(\mu\) et \(\sigma\) sont calculés sur les élèves d'entraînement et enregistrés avec
      les poids. La prédiction applique les mêmes valeurs aux nouveaux élèves.</p>`,
  },
  vraisemblance: {
    title: 'Vraisemblance',
    short: 'Probabilité que le modèle donne aux étiquettes observées ; les meilleurs poids la rendent maximale.',
    body: String.raw`
      <p>Un modèle probabiliste attribue une probabilité à chaque étiquette observée. La
      vraisemblance est le produit de ces probabilités sur toutes les observations, vu comme une
      fonction des paramètres :</p>
      \[ \mathcal{L}(w) = \prod_{i=1}^{n} P(y_i \mid x_i ; w). \]
      <p>La notation \(P(y_i \mid x_i ; w)\) se lit « probabilité de \(y_i\) sachant les notes
      \(x_i\), avec les poids \(w\) ». Le produit suppose les observations
      [[independance|indépendantes]].</p>
      <p>Le maximum de vraisemblance retient les poids qui rendent les étiquettes observées les
      plus probables. Le [[logarithme]] transforme le produit en somme. L'opposé de cette
      somme est la somme des pertes. Divisée par \(n\), elle donne le [[cout|coût]] \(J\) à
      minimiser. Fisher a développé la méthode entre 1912 et 1922.</p>`,
  },
  independance: {
    title: 'Indépendance',
    short: 'Deux événements sont indépendants quand la probabilité de les observer ensemble est le produit de leurs probabilités.',
    body: String.raw`
      <p>Deux événements \(A\) et \(B\) sont indépendants quand
      \(P(A \text{ et } B) = P(A)\,P(B)\). Connaître l'un ne change pas la probabilité de
      l'autre.</p>
      <p>La [[vraisemblance]] suppose les élèves indépendants, ce qui permet d'écrire la
      probabilité de toutes les étiquettes comme un produit. Cette hypothèse est une
      simplification du modèle.</p>`,
  },
  cote: {
    title: 'Cote',
    short: 'Rapport p / (1 − p) entre la probabilité d\'un événement et celle de son contraire.',
    body: String.raw`
      <p>La cote d'un événement de probabilité \(p\) est \(p / (1 - p)\). Une probabilité de
      0.8 donne une cote de 4, soit « 4 contre 1 ». La cote va de 0 à \(+\infty\) et vaut 1
      pour \(p = 0.5\).</p>
      <p>Le [[logit]] est le logarithme de la cote. En régression logistique, une hausse d'une
      unité de la note standardisée \(x_j\) ajoute \(w_j\) au logit, donc multiplie la cote par
      \(e^{w_j}\).</p>`,
  },
  logit: {
    title: 'Logit',
    short: 'Logarithme de la cote, ln(p / (1 − p)) ; réciproque de la sigmoïde.',
    body: String.raw`
      <p>Le logit d'une probabilité \(p\) est</p>
      \[ \operatorname{logit}(p) = \ln\frac{p}{1 - p}. \]
      <p>Il envoie \(]0, 1[\) sur \(\mathbb{R}\) et vaut 0 pour \(p = 0.5\). C'est la
      réciproque de la [[sigmoide|sigmoïde]] : si \(p = \sigma(z)\), alors
      \(\operatorname{logit}(p) = z\). La régression logistique suppose que le logit de la
      probabilité est une fonction [[fonction-affine|affine]] des notes. Berkson a introduit le
      mot en 1944.</p>`,
  },
  'entropie-croisee': {
    title: 'Entropie croisée',
    short: 'Nom de la perte ℓ = −[y ln p + (1 − y) ln(1 − p)], grande quand la vraie étiquette reçoit une faible probabilité.',
    body: String.raw`
      <p>Pour une étiquette \(y \in \{0, 1\}\) et une probabilité prédite \(p\), l'entropie
      croisée vaut</p>
      \[ \ell = -\big[\, y \ln p + (1 - y) \ln(1 - p) \,\big]. \]
      <p>Le terme vient de la théorie de l'information, où l'entropie croisée mesure le coût
      moyen du codage de données distribuées selon une loi avec un code optimisé pour une autre.
      Pour une étiquette 0 ou 1, elle se réduit à \(-\ln\) de la probabilité donnée à la vraie
      étiquette. Sa somme sur les élèves est l'opposé du logarithme de la
      [[vraisemblance]].</p>`,
  },
  'moyenne-harmonique': {
    title: 'Moyenne harmonique',
    short: 'Inverse de la moyenne des inverses ; proche de la plus petite des valeurs.',
    body: String.raw`
      <p>La moyenne harmonique de deux nombres positifs \(P\) et \(R\) est l'inverse de la
      moyenne de leurs inverses :</p>
      \[ \frac{2}{1/P + 1/R} = \frac{2PR}{P + R}. \]
      <p>Elle reste proche du plus petit des deux. Pour \(P = 1\) et \(R = 0.2\), la moyenne
      arithmétique vaut 0.6 et la moyenne harmonique 0.33. Le [[f1|F1]] l'utilise pour qu'une
      [[precision|précision]] élevée ne masque pas un [[rappel]] faible.</p>`,
  },
};
