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
    ['Contributions', `La contribution d'un élève à ${S.grad} est son erreur p − y multipliée
      par (1, ${S.x1}, ${S.x2}), soit une composante par poids ${S.w0}, ${S.w1}, ${S.w2}.`],
    ['Dérivation en chaîne', '∂ℓ/∂wⱼ = (∂ℓ/∂z) × (∂z/∂wⱼ), avec ∂z/∂w₀ = 1, ∂z/∂w₁ = x₁ et ∂z/∂w₂ = x₂.'],
    ['Moyenne', `∇J = (∂J/∂w₀, ∂J/∂w₁, ∂J/∂w₂) est la moyenne des contributions des ${c.n}
      élèves.`],
    [at(c), `∇J = (${c.gf.join(' ; ')}).`, true],
  ]),
  more: (c) => `
    <p>Dans ∇J = Xᵀ(p − y) / n, les lignes de X sont les vecteurs (1, x₁, x₂), p est le
    vecteur des probabilités et y celui des étiquettes.</p>
    <p>‖∇J‖ tend vers 0 à l'approche du minimum. Comme α est constant, les corrections
    α∇J diminuent d'autant. À cette itération, ‖∇J‖ = ${c.gradNorm}.</p>`,
};
