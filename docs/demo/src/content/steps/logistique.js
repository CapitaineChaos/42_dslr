// Sigmoïde : du score à la probabilité

import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'logistique',
  node: 'proba',
  phase: 'boucle',
  plot: 'sigmoide',
  title: 'Sigmoïde : du score à la probabilité',
  math: 'p_i = \\sigma(z_i) = \\dfrac{1}{1 + e^{-z_i}}',
  calc: { group: 'train', cols: ['name', 'y', 'z', 'p'], worked: 'p' },
  lead: (c) => spec([
    ['Calcul', `La sigmoïde ${S.sigmoid} transforme le score en probabilité :
      ${S.p} = σ(${S.z}) = 1 / (1 + e<sup>−z</sup>).`],
    ['Pourquoi', `Le score peut prendre toute valeur réelle, alors que la perte, à l'étape
      suivante, compare une probabilité à l'étiquette ${S.y}. La sigmoïde ramène tout score
      dans l'intervalle ]0, 1[.`],
    ['Propriété', 'σ est croissante : elle conserve l\'ordre des scores, et p &gt; 0.5 équivaut à z &gt; 0. La frontière de décision reste donc la même.'],
    ['Repères', 'σ(−3) ≈ 0.047, σ(0) = 0.5, σ(3) ≈ 0.953.'],
    [at(c), `Les probabilités vont de ${c.pMin} à ${c.pMax}.`, true],
  ]),
  more: () => `
    <p>σ est une bijection strictement croissante de ℝ sur ]0, 1[, avec σ(0) = 1/2 et
    σ(−z) = 1 − σ(z).</p>
    <p>Sa dérivée vérifie σ′(z) = σ(z)(1 − σ(z)). Elle est maximale en 0, où elle vaut
    1/4 ; c'est cette relation qui simplifie le calcul du gradient.</p>`,
};
