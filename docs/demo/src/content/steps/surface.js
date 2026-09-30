import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'surface',
  node: 'proba',
  phase: 'boucle',
  plot: 'surface',
  title: 'Surface de probabilité',
  math: 'p(x_1, x_2) = \\sigma(w_0 + w_1 x_1 + w_2 x_2)',
  calc: { group: 'train', cols: ['name', 'y', 'x1', 'x2', 'p'], worked: 'p' },
  lead: (c) => spec([
    ['Lignes de niveau', `Les lignes de niveau de ${S.p} sont des droites parallèles à la
      frontière, qui est la ligne de niveau 0.5. p tend vers 1 du côté de ${c.house} et vers 0
      du côté des autres maisons.`],
    ['Pente', `La pente est la plus forte sur la frontière, dans la direction de
      (${S.w1}, ${S.w2}). Elle y vaut σ′(0)·‖(w₁, w₂)‖, soit ‖(w₁, w₂)‖ / 4.`],
    [at(c), c.t === 0
      ? 'Les poids sont nuls, donc la surface est plane et p = 0.5 partout.'
      : `La pente maximale vaut ${c.slope}.`, true],
  ]),
  more: () => '',
};
