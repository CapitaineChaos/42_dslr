// Score linéaire z

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
    ['Entrée', `Les notes standardisées ${S.x1} et ${S.x2} de chaque élève, et les trois poids
      ${S.w0}, ${S.w1}, ${S.w2} du modèle.`],
    ['Calcul', `Le score de chaque élève est ${S.z} = ${S.w0} + ${S.w1}·${S.x1} + ${S.w2}·${S.x2}.`],
    ['Rôle', `Le score condense les deux notes en un seul nombre : positif, le modèle de
      ${c.house} range l'élève dans sa maison ; négatif, dans une autre. ${S.w1} et ${S.w2}
      fixent l'importance de chaque matière ; ${S.w0} déplace le seuil.`],
    [at(c), c.t === 0
      ? 'Les poids sont initialisés à 0 : tous les scores sont nuls.'
      : `w₀ = ${c.wf[0]}, w₁ = ${c.wf[1]}, w₂ = ${c.wf[2]}. Les scores vont de ${c.zMin}
         à ${c.zMax}.`, true],
  ]),
  more: (c) => `
    <p>Le score est une forme linéaire : z = wᵀx, où le vecteur x = (1, x₁, x₂) comporte
    une première composante constante égale à 1. Cette composante permet de traiter w₀
    comme un poids ordinaire.</p>
    <p>La valeur absolue d'un poids mesure l'influence de sa variable sur le score, son
    signe le sens de cette influence. Sur la figure Scores, chacun des ${c.n} élèves est
    placé à son score ; sa distance à 0 vaut ‖(w₁, w₂)‖ fois sa distance à la frontière
    dans le plan des notes.</p>`,
};
