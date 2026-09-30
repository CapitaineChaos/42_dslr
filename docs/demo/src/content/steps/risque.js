import { S } from '../symbols.js';
import { at, plural, spec } from './format.js';

export default {
  id: 'risque',
  node: 'perte',
  phase: 'boucle',
  plot: 'perte',
  title: 'Coût J',
  math: 'J(w) = \\dfrac{1}{n}\\sum_{i=1}^{n} \\ell_i(w)',
  calc: { group: 'train', cols: ['name', 'y', 'p', 'loss'], footer: 'J', worked: 'J' },
  intro: (c) => `Les poids sont communs à tous les élèves. Le critère à minimiser est donc le
    [[cout|coût]] J, moyenne des pertes ℓ des ${c.n} élèves d'entraînement.`,
  lead: (c) => spec([
    ['Minimisation', `Les données étant fixées, ${S.J} ne dépend que des poids ${S.w}. C'est la
      fonction que la [[descente-gradient|descente de gradient]] minimise.`],
    ['Nombre d\'erreurs', `Le nombre d'erreurs ne change que lorsqu'un élève change de côté.
      Entre deux changements, il reste plat, et sa pente nulle n'indique pas dans quel sens
      corriger les poids. Une descente ne peut donc pas le minimiser.`],
    [at(c), c.t === 0
      ? `J = ${c.cost} = ln 2, car p = 0.5 pour tous les élèves.`
      : `J = ${c.cost}. J valait ${c.costStart} à l'itération 0 et vaut ${c.costEnd} à
         l'arrêt.`, true],
  ]),
  more: (c) => String.raw`
    <h4>Convexité</h4>
    <p>La dérivée seconde de \(\ell_i\) par rapport à \(z_i\) vaut \(p_i(1 - p_i) > 0\), donc
    \(\ell_i\) est [[convexite|convexe]] en \(z_i\). Comme \(z_i\) est affine en \(w\), \(\ell_i\) est
    convexe en \(w\), et la moyenne \(J\) l'est aussi. Tout [[minimum|minimum local]] de \(J\) est
    global.</p>
    <p>${c.finalErrors
      ? `Le minimum est strictement positif, car ${c.finalErrors} ${plural(c.finalErrors, 'élève se trouve', 'élèves se trouvent')}
        dans la zone où les deux classes se recouvrent.`
      : String.raw`Dans ce passage, une droite [[separabilite|sépare]] les élèves de ${c.house} de tous les autres.
        \(J\) n'a pas de minimum et tend vers 0 quand les poids grandissent.`}</p>
    <p>\(J\) décroît à chaque itération, mais le nombre d'erreurs peut augmenter, par exemple
    quand la descente réduit la perte de deux élèves très mal placés et en fait basculer un
    troisième.</p>`,
};
