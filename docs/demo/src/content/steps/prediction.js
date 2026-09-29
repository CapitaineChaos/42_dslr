// Prédiction des élèves réservés

import { plural, spec } from './format.js';

export default {
  id: 'prediction',
  node: 'prediction',
  phase: 'aval',
  plot: 'frontiere',
  title: 'Prédiction des élèves réservés',
  math: null,
  calc: { group: 'test', cols: ['name', 'house', 'x1', 'x2', 'z0', 'z1', 'z2', 'hmax'], worked: 'argmax' },
  lead: (c) => spec([
    ['Modèle final', `Le dernier passage de l'entraînement porte sur les ${c.learnCount} élèves
      d'apprentissage ; ses ${c.houseCount} descentes s'arrêtent aux itérations ${c.stops}.
      Son exactitude attendue est celle de la validation croisée, ${c.cvAccuracy}&nbsp;%.`],
    ['Élèves', `Les ${c.testCount} élèves réservés n'ont servi à aucun calcul : ni médianes, ni μ,
      ni σ, ni poids.`],
    ['Calcul', `Leurs notes sont complétées par les médianes et standardisées avec les μ et σ
      des élèves d'apprentissage, puis chacun des ${c.houseCount} modèles calcule leur score ; la
      maison du plus grand score leur est attribuée.`],
    ['Vérification', 'Leur maison réelle, connue dans ce jeu, sert uniquement à contrôler les réponses.'],
    ['Résultat', `${c.testCorrect} sur ${c.testCount}
      ${plural(c.testCorrect, 'est bien classé', 'sont bien classés')}.`, true],
  ]),
  more: () => `
    <p>Recalculer μ et σ sur les élèves réservés changerait l'échelle des variables : les
    poids, appris pour l'échelle des élèves d'apprentissage, n'auraient plus de sens. C'est
    pourquoi le modèle enregistre, avec ses poids, les médianes, les moyennes et les écarts
    types.</p>`,
};
