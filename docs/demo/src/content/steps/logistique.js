import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'logistique',
  node: 'proba',
  phase: 'boucle',
  plot: 'sigmoide',
  title: 'Sigmoïde',
  math: 'p_i = \\sigma(z_i) = \\dfrac{1}{1 + e^{-z_i}}',
  calc: { group: 'train', cols: ['name', 'y', 'z', 'p'], worked: 'p' },
  lead: (c) => spec([
    ['Propriétés', `${S.sigmoid} est une bijection strictement croissante de ℝ sur ]0, 1[, avec
      σ(0) = 1/2 et σ(−z) = 1 − σ(z).`],
    ['Seuil', `Comme σ est croissante, ${S.p} &gt; 0.5 équivaut à ${S.z} &gt; 0. Le seuil 0.5
      sur p donne donc la frontière z = 0.`],
    [at(c), `Les probabilités vont de ${c.pMin} à ${c.pMax}.`, true],
  ]),
  more: () => `
    <p>σ′(z) = σ(z)(1 − σ(z)). La dérivée est maximale en 0, où elle vaut 1/4. Cette identité
    réduit ∂ℓ/∂z à p − y.</p>`,
};
