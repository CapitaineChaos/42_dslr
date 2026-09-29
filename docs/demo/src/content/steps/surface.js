// Surface de probabilité

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
    ['Définition', `La probabilité ${S.p}(${S.x1}, ${S.x2}) = σ(w₀ + w₁x₁ + w₂x₂) est définie
      en tout point du plan des notes, et non seulement pour les ${c.n} élèves.`],
    ['Forme', `Elle forme une surface en S : p vaut 0.5 sur la frontière, tend vers 1 du côté
      de ${c.house} et vers 0 du côté des autres maisons.`],
    ['Pente', `Sa pente maximale vaut ‖(${S.w1}, ${S.w2})‖ / 4. Plus les poids sont grands,
      plus la transition entre les deux maisons est abrupte.`],
    [at(c), c.t === 0
      ? 'Les poids étant nuls, la surface est plane : p = 0.5 en tout point.'
      : `Pente maximale : ${c.slope}.`, true],
  ]),
  more: () => `
    <p>La surface est la composée de σ et de la forme linéaire z = w₀ + w₁x₁ + w₂x₂. Ses
    lignes de niveau sont des droites parallèles à la frontière ; la ligne de niveau 1/2 est
    la frontière elle-même.</p>
    <p>La pente est maximale dans la direction de (w₁, w₂), et vaut
    σ′(0) · ‖(w₁, w₂)‖ = ‖(w₁, w₂)‖ / 4.</p>`,
};
