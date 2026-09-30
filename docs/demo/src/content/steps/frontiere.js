import { S } from '../symbols.js';
import { at, plural, spec } from './format.js';

const misplaced = (c) => (c.errors
  ? `${c.errors} ${plural(c.errors, 'élève', 'élèves')} sur ${c.n} ${plural(c.errors, 'est mal placé', 'sont mal placés')}.`
  : 'Aucun élève n\'est mal placé.');

export default {
  id: 'frontiere',
  node: 'score',
  phase: 'boucle',
  plot: 'frontiere',
  title: 'Frontière de décision z = 0',
  math: 'w_0 + \\sum_{j=1}^{d} w_j\\, x_j = 0',
  calc: { group: 'train', cols: ['name', 'house', 'y', 'z', 'side'], worked: 'side' },
  intro: (c) => `Le modèle de ${c.house} décide d'après le signe du score. Les points où le score
    s'annule forment la [[frontiere-decision|frontière]] entre ses deux décisions.`,
  lead: (c) => spec([
    ['Côté', `Le modèle de ${c.house} place un élève du côté de ${c.house} si ${S.z} &gt; 0, du
      côté des autres maisons sinon.`],
    ['Droite', `Avec deux notes, la frontière est une droite du plan des notes. ${S.w1} et
      ${S.w2} fixent son orientation, ${S.w0} la déplace sans la tourner.`],
    ['Élève mal placé', `Un élève est mal placé quand son côté contredit son étiquette y. Il
      est alors cerclé dans le plan des notes.`],
    [at(c), c.t === 0
      ? `Tous les scores sont nuls. Aucun élève n'est du côté de ${c.house}, donc ses
         ${c.positives} élèves sont mal placés.`
      : misplaced(c), true],
  ]),
  more: () => String.raw`
    <p>Pour \(d = 2\) et \(w_2 \neq 0\), la frontière est la droite</p>
    \[ x_2 = -\frac{w_0 + w_1 x_1}{w_2}, \]
    <p>de pente \(-w_1 / w_2\). Le vecteur \((w_1, w_2)\) lui est
    [[vecteur-normal|perpendiculaire]], et \(w_0\) la déplace parallèlement à elle-même. Pour \(d = 3\), la frontière est un plan, et en dimension
    \(d\) un [[hyperplan]]. dslr, avec 10 matières, trace un hyperplan dans un espace à 10
    dimensions.</p>
    <p>L'origine du plan des notes standardisées est l'élève moyen, dont toutes les notes
    standardisées sont nulles. Sa [[distance-frontiere|distance à la frontière]] vaut
    \(|w_0| / \lVert \tilde w \rVert\), où \(\tilde w = (w_1, \dots, w_d)\).</p>`,
};
