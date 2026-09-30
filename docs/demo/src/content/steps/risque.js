import { S } from '../symbols.js';
import { at, plural, spec } from './format.js';

export default {
  id: 'risque',
  node: 'perte',
  phase: 'boucle',
  plot: 'perte',
  title: 'Perte moyenne J',
  math: 'J(w) = \\dfrac{1}{n}\\sum_{i=1}^{n} \\ell_i(w)',
  calc: { group: 'train', cols: ['name', 'y', 'p', 'loss'], footer: 'J', worked: 'J' },
  lead: (c) => spec([
    ['Minimisation', `Les données étant fixées, ${S.J} ne dépend que des poids ${S.w}. C'est la
      fonction que la descente de gradient minimise.`],
    ['Nombre d\'erreurs', `Le nombre d'erreurs est constant par morceaux en w. Son gradient est
      nul presque partout, donc une descente ne peut pas le minimiser.`],
    [at(c), c.t === 0
      ? `J = ${c.cost} = ln 2, car p = 0.5 pour tous les élèves.`
      : `J = ${c.cost}. J valait ${c.costStart} à l'itération 0 et vaut ${c.costEnd} à
         l'arrêt.`, true],
  ]),
  more: (c) => `
    <p>J est une moyenne de fonctions convexes des poids, donc J est convexe. Tout minimum
    local de J est global.</p>
    <p>${c.finalErrors
      ? `Le minimum est strictement positif, car ${c.finalErrors} ${plural(c.finalErrors, 'élève se trouve', 'élèves se trouvent')}
        dans la zone où les deux classes se recouvrent.`
      : `Dans ce passage, une droite sépare les élèves de ${c.house} de tous les autres. J
        n'a pas de minimum et tend vers 0 quand les poids grandissent.`}</p>
    <p>J décroît à chaque itération, mais le nombre d'erreurs peut augmenter, par exemple
    quand la descente réduit la perte de deux élèves très mal placés et en fait basculer un
    troisième.</p>`,
};
