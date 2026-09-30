import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'surface',
  node: 'proba',
  phase: 'boucle',
  plot: 'surface',
  title: 'Surface de probabilité',
  math: 'p(x) = \\sigma\\Big(w_0 + \\sum_{j=1}^{d} w_j\\, x_j\\Big)',
  calc: { group: 'train', cols: ['name', 'y', 'x1', 'x2', 'p'], worked: 'p' },
  intro: () => `La sigmoïde s'applique en tout point du plan des notes, y compris là où il n'y a
    aucun élève. Elle donne une surface, la probabilité prédite pour chaque paire de notes.`,
  lead: (c) => spec([
    ['Lignes de niveau', `Les lignes de niveau de ${S.p} sont des droites parallèles à la
      frontière, qui est la ligne de niveau 0.5. p tend vers 1 du côté de ${c.house} et vers 0
      du côté des autres maisons.`],
    ['Pente', `La surface monte le plus vite en traversant la frontière. Plus les poids
      ${S.w1} et ${S.w2} sont grands, plus cette montée est raide.`],
    [at(c), c.t === 0
      ? 'Les poids sont nuls, donc la surface est plane et p = 0.5 partout.'
      : `La pente maximale vaut ${c.slope}.`, true],
  ]),
  more: () => String.raw`
    <p>La pente maximale est atteinte sur la frontière, dans la direction de
    \(\tilde w = (w_1, w_2)\). Elle vaut \(\sigma'(0)\,\lVert \tilde w \rVert\), soit
    \(\lVert \tilde w \rVert / 4\), où \(\lVert \tilde w \rVert\) est la [[norme]] de
    \(\tilde w\).</p>
    <p>Le long de la direction \((w_1, w_2)\), la surface a le profil de la sigmoïde, étiré
    d'un facteur \(1/\lVert (w_1, w_2) \rVert\). Quand les poids grandissent, la transition
    autour de la frontière devient plus abrupte, et la surface tend vers une marche.</p>`,
};
