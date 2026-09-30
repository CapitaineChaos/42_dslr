import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'score',
  node: 'score',
  phase: 'boucle',
  plot: 'scores',
  title: 'Score linéaire z',
  math: 'z_i = w_0 + w_1 x_{i1} + w_2 x_{i2} = w^{\\mathsf T} x_i',
  calc: { group: 'train', cols: ['name', 'house', 'y', 'x1', 'x2', 'z'], worked: 'z' },
  lead: (c) => spec([
    ['Notation', `x = (1, ${S.x1}, ${S.x2}) et w = (${S.w0}, ${S.w1}, ${S.w2}). La composante
      constante de x permet de traiter w₀ comme les deux autres poids.`],
    ['Poids', `w₁ est la variation de ${S.z} pour un écart type de ${c.label0}, w₂ pour un écart
      type de ${c.label1}. w₀ est le score d'un élève dont les deux notes sont à la moyenne.`],
    [at(c), c.t === 0
      ? 'Les poids sont initialisés à 0, donc tous les scores sont nuls.'
      : `w₀ = ${c.wf[0]}, w₁ = ${c.wf[1]}, w₂ = ${c.wf[2]}. Les scores vont de ${c.zMin}
         à ${c.zMax}.`, true],
  ]),
  more: () => `
    <p>|z| est égal à ‖(w₁, w₂)‖ fois la distance de l'élève à la frontière dans le plan
    des notes.</p>`,
};
