// Perte moyenne J

import { S } from '../symbols.js';
import { at, plural, spec, sub } from './format.js';

export default {
  id: 'risque',
  node: 'perte',
  phase: 'boucle',
  plot: 'perte',
  title: 'Perte moyenne J',
  math: 'J(w) = \\dfrac{1}{n}\\sum_{i=1}^{n} \\ell_i(w)',
  calc: { group: 'train', cols: ['name', 'y', 'p', 'loss'], footer: 'J', worked: 'J' },
  lead: (c) => spec([
    ['Calcul', `La perte du modèle est la moyenne des pertes individuelles :
      ${S.J} = (ℓ₁ + … + ℓ${sub(c.n)}) / ${c.n}.`],
    ['Rôle', `À données fixées, J ne dépend que des poids ${S.w} : c'est la fonction que la
      descente de gradient minimise.`],
    ['Pourquoi pas les erreurs', `Le nombre d'erreurs est constant par paliers : sa dérivée est
      nulle presque partout et n'indique aucune direction de correction.`],
    [at(c), c.t === 0
      ? `J = ${c.cost} = ln 2, car p = 0.5 pour tous les élèves.`
      : `J = ${c.cost}. J valait ${c.costStart} à l'itération 0 et vaudra ${c.costEnd} à
         l'arrêt.`, true],
  ]),
  more: (c) => `
    <p>J est une moyenne de fonctions convexes des poids ; elle est donc convexe. Tout
    minimum local est global : la descente de gradient ne peut pas s'arrêter dans un
    minimum parasite.</p>
    <p>${c.finalErrors
      ? `Le minimum atteint est strictement positif, car ${c.finalErrors} ${plural(c.finalErrors, 'élève se trouve', 'élèves se trouvent')}
        dans la zone de recouvrement des deux maisons.`
      : `Dans ce passage, une droite sépare les élèves de ${c.house} de tous les autres : J
        n'a pas de minimum et tend vers 0 à mesure que les poids grandissent.`}
    J décroît à chaque itération, alors que le nombre d'erreurs évolue par sauts ; il peut
    même augmenter lorsque la descente réduit la perte de deux élèves très mal classés au
    prix du basculement d'un troisième.</p>`,
};
