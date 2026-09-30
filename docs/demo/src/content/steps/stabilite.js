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
  intro: () => `La formule de σ est exacte, mais son calcul direct en virgule flottante échoue
    pour les scores très négatifs. Une écriture équivalente évite ce débordement.`,
  lead: () => spec([
    ['Débordement', `Un [[flottant]] en double précision ne dépasse pas 1.8 × 10³⁰⁸, valeur
      que e<sup>z</sup> atteint pour z ≈ 709.8. Dans 1 / (1 + e<sup>−z</sup>), l'exponentielle
      [[debordement|déborde]] donc dès que z &lt; −709.8.`],
    ['Écriture stable', `Le code choisit l'écriture selon le signe de z, de sorte que
      l'exposant soit négatif ou nul. L'exponentielle reste alors dans ]0, 1].`],
    ['softplus', `[[softplus|softplus(z)]] = ln(1 + e<sup>z</sup>) est calculé sous la forme
      max(0, z) + ln(1 + e<sup>−|z|</sup>), dont l'exposant est aussi négatif ou nul.`],
  ]),
  more: () => String.raw`
    <p>La seconde écriture de σ s'obtient en multipliant le numérateur et le dénominateur de la
    première par \(e^{z}\) :</p>
    \[ \frac{1}{1 + e^{-z}} = \frac{e^{z}}{e^{z} + 1}. \]
    <p>Pour \(z > 0\),</p>
    \[ \ln(1 + e^{z}) = \ln\big(e^{z}\,(1 + e^{-z})\big) = z + \ln(1 + e^{-z}). \]
    <p>Pour \(z \le 0\), l'exposant de \(\ln(1 + e^{z})\) est déjà négatif ou nul. Les deux cas
    s'écrivent \(\max(0, z) + \ln(1 + e^{-|z|})\).</p>`,
};
