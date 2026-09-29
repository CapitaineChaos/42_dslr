// Évaluation du pli

import { plural, spec } from './format.js';

export default {
  id: 'evaluation-pli',
  node: 'validation',
  phase: 'valid',
  plot: 'frontiere',
  title: 'Évaluation du pli',
  math: null,
  calc: { group: 'held', cols: ['name', 'house', 'x1', 'x2', 'z0', 'z1', 'z2', 'hmax'], worked: 'argmax' },
  lead: (c) => spec([
    ['Élèves du pli', `Les ${c.heldCount} élèves du pli ${c.pli + 1} ont été écartés de tout le
      passage : ni la médiane, ni μ, ni σ, ni les poids des ${c.houseCount} modèles ne dépendent
      d'eux.`],
    ['Calcul', `Leurs notes sont complétées et standardisées avec les paramètres du passage,
      puis chacun des ${c.houseCount} modèles, à son arrêt, calcule leur score ; la maison du
      plus grand score leur est attribuée.`],
    ['Résultat', `${c.heldCorrect} sur ${c.heldCount} ${plural(c.heldCorrect, 'est bien classé', 'sont bien classés')}.`, true],
    ['Suite', c.pli + 1 < c.k
      ? `Ces décisions sont conservées pour le bilan ; la validation relance l'entraînement
         avec le pli ${c.pli + 2} mis de côté.`
      : `Les ${c.k} plis sont évalués : chacun des ${c.learnCount} élèves a été classé une
         fois. Suit le bilan.`],
  ]),
  more: () => `
    <p>Les élèves du pli jouent le rôle d'élèves nouveaux : les modèles qui les classent
    n'ont utilisé aucune de leurs notes. Sur les élèves d'entraînement, l'exactitude est
    optimiste, puisque les poids ont été ajustés sur eux.</p>
    <p>La boucle des plis part d'ici : chaque tour enchaîne la préparation, les
    descentes des trois maisons et l'évaluation, avec un autre pli mis de côté.</p>`,
};
