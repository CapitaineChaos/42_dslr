// Frontière de décision z = 0

import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'frontiere',
  node: 'score',
  phase: 'boucle',
  plot: 'frontiere',
  title: 'Frontière de décision z = 0',
  math: 'z = 0 \\iff x_2 = -\\dfrac{w_0 + w_1 x_1}{w_2}',
  calc: { group: 'train', cols: ['name', 'house', 'y', 'z', 'side'], worked: 'side' },
  lead: (c) => spec([
    ['Règle', `Pour le modèle de ${c.house} seul, un élève est du côté de ${c.house} si
      ${S.z} &gt; 0, du côté des autres maisons sinon.`],
    ['Géométrie', `Dans le plan (${S.x1}, ${S.x2}), les points où z = 0 forment une droite, la
      frontière de décision. Le vecteur (${S.w1}, ${S.w2}) lui est perpendiculaire et fixe son
      orientation ; ${S.w0} la translate.`],
    ['Erreur', `Un élève est mal placé lorsque ce côté contredit son étiquette y. Il est
      cerclé sur la figure et marqué d'un liseré violet dans le tableau.`],
    [at(c), c.t === 0
      ? `Tous les scores sont nuls : aucun élève n'est du côté de ${c.house}, et ses
         ${c.positives} élèves sont mal placés.`
      : `${c.errors} élèves sur ${c.n} sont mal placés.`, true],
  ]),
  more: () => `
    <p>L'ensemble des points où z = 0 est une droite, qui partage le plan en deux
    demi-plans : z &gt; 0 d'un côté, z &lt; 0 de l'autre. Classer un élève selon le signe
    de son score revient à attribuer une maison à chaque demi-plan.</p>
    <p>Le vecteur (w₁, w₂) est normal à la frontière. À orientation fixée, w₀ la déplace
    le long de cette normale : la distance de la frontière à l'origine vaut
    |w₀| / ‖(w₁, w₂)‖.</p>`,
};
