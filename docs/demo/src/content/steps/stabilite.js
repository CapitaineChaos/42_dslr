// Stabilité numérique de σ

import { spec } from './format.js';

export default {
  id: 'stabilite',
  node: 'proba',
  phase: 'boucle',
  plot: 'sigmoide',
  widget: 'overflow',
  title: 'Stabilité numérique de σ',
  math: '\\sigma(z) = \\begin{cases} 1/(1+e^{-z}) & z \\geq 0 \\\\ e^{z}/(1+e^{z}) & z < 0\\end{cases}',
  calc: null,
  lead: () => spec([
    ['Problème', `Un nombre flottant en double précision ne peut dépasser 1.8 × 10³⁰⁸, valeur
      que e<sup>z</sup> atteint pour z ≈ 709.8. Écrite sous la forme 1 / (1 + e<sup>−z</sup>),
      la sigmoïde calcule donc un infini dès que z &lt; −709.8.`],
    ['Solution', `Le code emploie deux écritures équivalentes : 1 / (1 + e<sup>−z</sup>) lorsque
      z ≥ 0, et e<sup>z</sup> / (1 + e<sup>z</sup>) lorsque z &lt; 0. L'exposant étant
      toujours négatif ou nul, l'exponentielle reste comprise entre 0 et 1.`],
    ['Perte', 'La perte applique le même principe : ln(1 + e<sup>z</sup>) est calculé sous la forme max(0, z) + ln(1 + e<sup>−|z|</sup>).'],
    ['Atelier', 'Le curseur fait varier z. Au-delà de 710 en valeur absolue, l\'écriture directe produit Infinity ou NaN, tandis que l\'écriture du code reste exacte.'],
  ]),
  more: () => `
    <p>Les deux écritures sont égales en arithmétique exacte : il suffit de multiplier le
    numérateur et le dénominateur de 1 / (1 + e<sup>−z</sup>) par e<sup>z</sup>. Elles
    diffèrent en arithmétique flottante, où seule l'écriture dont l'exposant est négatif ou
    nul reste représentable pour tout z.</p>
    <p>ln(1 + e<sup>z</sup>) se comporte comme z lorsque z est grand. L'écriture
    max(0, z) + ln(1 + e<sup>−|z|</sup>) exploite cette propriété sans jamais calculer
    l'exponentielle d'un grand nombre.</p>`,
};
