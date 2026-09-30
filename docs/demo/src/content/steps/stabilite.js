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
    ['Débordement', `Un flottant en double précision ne dépasse pas 1.8 × 10³⁰⁸, valeur que
      e<sup>z</sup> atteint pour z ≈ 709.8. Dans 1 / (1 + e<sup>−z</sup>), l'exponentielle
      déborde donc dès que z &lt; −709.8.`],
    ['Écriture stable', `Le code choisit l'écriture selon le signe de z, de sorte que
      l'exposant soit négatif ou nul. L'exponentielle reste alors dans ]0, 1].`],
    ['softplus', `ln(1 + e<sup>z</sup>) est calculé sous la forme
      max(0, z) + ln(1 + e<sup>−|z|</sup>), dont l'exposant est aussi négatif ou nul.`],
  ]),
  more: () => `
    <p>Les deux écritures de σ sont égales. La seconde s'obtient en multipliant le
    numérateur et le dénominateur de la première par e<sup>z</sup>.</p>
    <p>Pour z &gt; 0, ln(1 + e<sup>z</sup>) = z + ln(1 + e<sup>−z</sup>), d'où la forme
    max(0, z) + ln(1 + e<sup>−|z|</sup>).</p>`,
};
