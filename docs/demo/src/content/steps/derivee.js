import { S } from '../symbols.js';
import { spec } from './format.js';

export default {
  id: 'derivee',
  node: 'gradient',
  phase: 'boucle',
  plot: 'chemin',
  title: 'Erreur p − y',
  math: '\\dfrac{\\partial \\ell_i}{\\partial z_i} = p_i - y_i',
  calc: { group: 'train', cols: ['name', 'y', 'p', 'err'], worked: 'err' },
  intro: () => `Pour savoir dans quel sens corriger les poids, la descente
    [[derivee|dérive]] la perte. Elle
    commence par la dérivée par rapport au score, qui se réduit à l'écart entre la probabilité
    et l'étiquette.`,
  lead: (c) => spec([
    ['Signe', `Pour un élève de ${c.house}, p − y &lt; 0, donc augmenter z réduit sa perte. Pour
      un élève d'une autre maison, p − y &gt; 0, donc diminuer z réduit sa perte.`],
    ['Amplitude', `|${S.err}| va de 0, quand la probabilité coïncide avec l'étiquette, à 1,
      quand elle lui est opposée. Un élève bien classé loin de la frontière pèse donc peu
      dans le gradient.`],
  ]),
  more: (c) => String.raw`
    <p>Avec la forme stable de la perte,</p>
    \[ \ell = \ln(1 + e^{z}) - y\,z, \qquad
       \frac{d}{dz}\ln(1 + e^{z}) = \frac{e^{z}}{1 + e^{z}} = \sigma(z), \]
    <p>donc</p>
    \[ \frac{\partial \ell}{\partial z} = \sigma(z) - y = p - y. \]
    <p>À l'itération 0, \(p = 0.5\) pour tous les élèves. L'erreur vaut \(-0.5\) pour un
    élève de ${c.house} et \(+0.5\) pour un élève d'une autre maison.</p>`,
};
