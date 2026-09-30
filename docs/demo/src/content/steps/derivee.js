import { S } from '../symbols.js';
import { spec } from './format.js';

export default {
  id: 'derivee',
  node: 'gradient',
  phase: 'boucle',
  plot: 'chemin',
  title: 'Erreur p − y',
  math: '\\dfrac{\\partial \\ell_i}{\\partial z_i} = \\sigma(z_i) - y_i = p_i - y_i',
  calc: { group: 'train', cols: ['name', 'y', 'p', 'err'], worked: 'err' },
  lead: () => spec([
    ['Amplitude', `|${S.err}| va de 0, quand la probabilité coïncide avec l'étiquette, à 1,
      quand elle lui est opposée. Un élève bien classé loin de la frontière pèse donc peu
      dans le gradient.`],
  ]),
  more: (c) => `
    <p>Pour y = 1, ℓ = −ln σ(z). Comme σ′ = σ(1 − σ), la dérivée vaut ∂ℓ/∂z = −(1 − σ(z))
    = p − 1. Pour y = 0, ℓ = −ln(1 − σ(z)), d'où ∂ℓ/∂z = σ(z) = p. Les deux cas s'écrivent
    ∂ℓ/∂z = p − y.</p>
    <p>À l'itération 0, p = 0.5 pour tous les élèves. L'erreur vaut −0.5 pour un élève de
    ${c.house} et +0.5 pour un élève d'une autre maison.</p>`,
};
