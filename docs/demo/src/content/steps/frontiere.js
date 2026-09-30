import { S } from '../symbols.js';
import { at, plural, spec } from './format.js';

const misplaced = (c) => (c.errors
  ? `${c.errors} ${plural(c.errors, 'élève', 'élèves')} sur ${c.n} ${plural(c.errors, 'est mal placé', 'sont mal placés')}.`
  : 'Aucun élève n\'est mal placé.');

export default {
  id: 'frontiere',
  node: 'score',
  phase: 'boucle',
  plot: 'frontiere',
  title: 'Frontière de décision z = 0',
  math: 'z = 0 \\iff x_2 = -\\dfrac{w_0 + w_1 x_1}{w_2}',
  calc: { group: 'train', cols: ['name', 'house', 'y', 'z', 'side'], worked: 'side' },
  lead: (c) => spec([
    ['Côté', `Le modèle de ${c.house} place un élève du côté de ${c.house} si ${S.z} &gt; 0, du
      côté des autres maisons sinon.`],
    ['Droite', `Dans le plan (${S.x1}, ${S.x2}), z = 0 est une droite, la frontière de
      décision. Le vecteur (${S.w1}, ${S.w2}) lui est normal, et ${S.w0} la translate le long
      de cette normale.`],
    ['Élève mal placé', `Un élève est mal placé quand son côté contredit son étiquette y. Il
      est alors cerclé dans le plan des notes.`],
    [at(c), c.t === 0
      ? `Tous les scores sont nuls. Aucun élève n'est du côté de ${c.house}, donc ses
         ${c.positives} élèves sont mal placés.`
      : misplaced(c), true],
  ]),
  more: () => `
    <p>La distance de la frontière à l'origine vaut |w₀| / ‖(w₁, w₂)‖.</p>`,
};
