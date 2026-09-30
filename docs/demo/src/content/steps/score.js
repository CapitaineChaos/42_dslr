import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'score',
  node: 'score',
  phase: 'boucle',
  plot: 'scores',
  title: 'Score linéaire z',
  math: 'z_i = w_0 + \\sum_{j=1}^{d} w_j\\, x_{ij}',
  calc: { group: 'train', cols: ['name', 'house', 'y', 'x1', 'x2', 'z'], worked: 'z' },
  intro: () => `Pour classer un élève, le modèle réduit ses notes à un seul nombre, leur somme
    pondérée. Le signe de chaque poids indique si une bonne note dans la matière rapproche
    l'élève de la maison ou l'en éloigne.`,
  lead: (c) => spec([
    ['Notation', `d est le nombre de matières, ici ${c.courses.length}, et x<sub>ij</sub> la note
      standardisée de l'élève i dans la matière j. Pour d = 2,
      ${S.z} = ${S.w0} + ${S.w1}${S.x1} + ${S.w2}${S.x2}.`],
    ['Poids', `w₁ est la variation de ${S.z} pour un écart type de ${c.label0}, w₂ pour un écart
      type de ${c.label1}. w₀ est le score d'un élève dont les deux notes sont à la moyenne.`],
    [at(c), c.t === 0
      ? 'Les poids sont initialisés à 0, donc tous les scores sont nuls.'
      : `w₀ = ${c.wf[0]}, w₁ = ${c.wf[1]}, w₂ = ${c.wf[2]}. Les scores vont de ${c.zMin}
         à ${c.zMax}.`, true],
  ]),
  more: () => String.raw`
    <h4>Forme vectorielle</h4>
    <p>Les poids forment le [[vecteur]] \(w = (w_0, w_1, \dots, w_d)\). Les notes de l'élève
    \(i\), précédées d'un 1, forment le vecteur \(x_i = (1, x_{i1}, \dots, x_{id})\). Le score
    est leur [[produit-scalaire|produit scalaire]] :</p>
    \[ z_i = w^{\mathsf T} x_i = w_0 \cdot 1 + w_1 x_{i1} + \dots + w_d x_{id}. \]
    <p>Le 1 en tête de \(x_i\) permet de traiter \(w_0\) comme les autres poids. Pour les \(n\)
    élèves à la fois, les scores forment le vecteur \(z = Xw\), où la ligne \(i\) de la
    [[matrice]] \(X\) est \(x_i\).</p>
    <h4>Distance à la frontière</h4>
    <p>La frontière est l'ensemble des points de l'espace des notes où le score s'annule. Le
    score d'un élève dit aussi à quelle [[distance-frontiere|distance]] il se trouve de cette
    frontière. Soit \(\tilde w = (w_1, \dots, w_d)\) le vecteur des poids des notes, sans
    \(w_0\), et \(\lVert \tilde w \rVert = \sqrt{w_1^2 + \dots + w_d^2}\) sa [[norme]],
    c'est-à-dire sa longueur. La distance de l'élève \(i\) à la frontière vaut</p>
    \[ d_i = \frac{|z_i|}{\lVert \tilde w \rVert}. \]
    <p>Le score est donc cette distance multipliée par \(\lVert \tilde w \rVert\), et son
    signe indique le côté. Un élève loin de la frontière a un score grand en valeur
    absolue.</p>`,
};
