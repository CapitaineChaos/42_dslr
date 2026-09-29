// Erreur p − y

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
    ['Calcul', `Pour chaque élève, on calcule l'erreur ${S.err}.`],
    ['Origine', 'p − y est la dérivée de la perte ℓ par rapport au score z.'],
    ['Lecture', `Une erreur négative signifie qu'augmenter z réduirait la perte ; une erreur
      positive, qu'il faudrait le diminuer. Une erreur proche de 0 désigne un élève bien
      classé, dont l'influence sur la correction est négligeable.`],
    ['Suite', 'L\'étape suivante répartit ces erreurs sur les trois poids.'],
  ]),
  more: (c) => `
    <p>Pour y = 1, ℓ = −ln σ(z). Comme σ′ = σ(1 − σ), on obtient ∂ℓ/∂z = −(1 − σ(z))
    = p − 1. Pour y = 0, ℓ = −ln(1 − σ(z)), d'où ∂ℓ/∂z = σ(z) = p. Les deux cas s'écrivent
    ∂ℓ/∂z = p − y.</p>
    <p>À l'itération 0, p = 0.5 pour tous les élèves : l'erreur vaut −0.5 pour un élève de
    ${c.house} et +0.5 pour un élève des autres maisons.</p>`,
};
