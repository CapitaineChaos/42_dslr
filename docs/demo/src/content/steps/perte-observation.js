// Perte d'un élève : entropie croisée

import { S } from '../symbols.js';
import { spec } from './format.js';

export default {
  id: 'perte-observation',
  node: 'perte',
  phase: 'boucle',
  plot: 'perte',
  title: "Perte d'un élève : entropie croisée",
  math: '\\ell_i = -y_i\\ln p_i - (1-y_i)\\ln(1-p_i) = \\operatorname{softplus}(z_i) - y_i z_i',
  calc: { group: 'train', cols: ['name', 'y', 'p', 'loss'], worked: 'loss' },
  lead: () => spec([
    ['Calcul', `${S.loss} = −ln(${S.p}) si ${S.y} = 1, et ℓ = −ln(1 − p) si y = 0. C'est
      l'entropie croisée binaire.`],
    ['Lecture', `ℓ est l'opposé du logarithme de la probabilité attribuée à la maison réelle :
      elle vaut 0 si cette probabilité est 1, 0.693 si elle est 0.5, et 4.61 si elle est
      0.01.`],
    ['Pourquoi', `Cette perte pénalise d'autant plus une erreur qu'elle est commise avec une
      probabilité élevée. De plus, sa dérivée par rapport à z vaut simplement p − y, ce qui
      rend le calcul du gradient direct.`],
    ['Forme du code', 'Le code calcule ℓ = softplus(z) − y·z, expression égale qui n\'évalue jamais le logarithme de 0.'],
  ]),
  more: () => `
    <p>Les deux cas se réunissent en ℓ = −y·ln p − (1 − y)·ln(1 − p), puisque y vaut 0 ou
    1. En remplaçant p par σ(z), on obtient ℓ = ln(1 + e<sup>z</sup>) − y·z.</p>
    <p>Cette fonction est convexe en z et strictement positive. Elle tend vers +∞ lorsque la
    probabilité attribuée à la maison réelle tend vers 0.</p>`,
};
