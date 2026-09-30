import { S } from '../symbols.js';
import { spec } from './format.js';

export default {
  id: 'perte-observation',
  node: 'perte',
  phase: 'boucle',
  plot: 'perte',
  title: "Perte ℓ d'un élève",
  math: '\\ell_i = -y_i\\ln p_i - (1-y_i)\\ln(1-p_i) = \\operatorname{softplus}(z_i) - y_i z_i',
  calc: { group: 'train', cols: ['name', 'y', 'p', 'loss'], worked: 'loss' },
  lead: () => spec([
    ['Entropie croisée', `${S.loss} est l'opposé du logarithme de la probabilité que le modèle
      donne à l'étiquette de l'élève : −ln ${S.p} si ${S.y} = 1, −ln(1 − p) si y = 0.`],
    ['Valeurs', `ℓ vaut 0 quand cette probabilité vaut 1, 0.693 pour 0.5 et 4.61 pour 0.01.
      Elle tend vers l'infini quand la probabilité tend vers 0.`],
    ['Propriétés', 'ℓ est convexe en z, et ∂ℓ/∂z = p − y.'],
    ['Code', 'Le code calcule ℓ = softplus(z) − y·z, qui n\'évalue jamais ln 0.'],
  ]),
  more: () => `
    <p>Avec p = σ(z), ℓ = ln(1 + e<sup>z</sup>) − y·z = softplus(z) − y·z.</p>`,
};
