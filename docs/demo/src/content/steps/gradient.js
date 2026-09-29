// Gradient ∇J

import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'gradient',
  node: 'gradient',
  phase: 'boucle',
  plot: 'chemin',
  title: 'Gradient ∇J',
  math: '\\nabla J(w) = \\dfrac{1}{n} X^{\\mathsf T}(p - y)',
  calc: { group: 'train', cols: ['name', 'err', 'x1', 'x2', 'c0', 'c1', 'c2'], footer: 'grad', worked: 'contrib' },
  lead: (c) => spec([
    ['Calcul', `Pour chaque élève, l'erreur p − y est multipliée par (1, ${S.x1}, ${S.x2}) ; on
      obtient ses contributions aux dérivées de J par rapport à ${S.w0}, ${S.w1} et ${S.w2}.`],
    ['Justification', 'Par dérivation en chaîne, ∂ℓ/∂wⱼ = (∂ℓ/∂z) × (∂z/∂wⱼ), avec ∂z/∂w₀ = 1, ∂z/∂w₁ = x₁ et ∂z/∂w₂ = x₂.'],
    ['Somme', `Les contributions sont additionnées colonne par colonne, puis divisées par
      ${c.n} : on obtient le gradient ${S.grad} = (∂J/∂w₀, ∂J/∂w₁, ∂J/∂w₂).`],
    [at(c), `∇J = (${c.gf.join(' ; ')}).`, true],
  ]),
  more: (c) => `
    <p>Sous forme matricielle, avec X la matrice dont chaque ligne est (1, x₁, x₂), p le
    vecteur des probabilités et y celui des étiquettes, le gradient s'écrit
    ∇J = Xᵀ(p − y) / n. Il a la même dimension que w, ce qui permet de le soustraire
    directement aux poids.</p>
    <p>Sa norme tend vers 0 à l'approche du minimum : à α constant, les pas de correction
    raccourcissent d'eux-mêmes. À cette itération, ‖∇J‖ = ${c.gradNorm}.</p>`,
};
