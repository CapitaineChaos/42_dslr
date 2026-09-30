import { plural, spec } from './format.js';

export default {
  id: 'prediction',
  node: 'prediction',
  phase: 'aval',
  plot: 'frontiere',
  title: 'Prédiction des élèves réservés',
  math: null,
  calc: { group: 'test', cols: ['name', 'house', 'x1', 'x2', 'z0', 'z1', 'z2', 'hmax'], worked: 'argmax' },
  intro: (c) => (c.crossValidation
    ? `Les modèles des plis n'ont servi qu'à estimer l'exactitude. La prédiction utilise le
      modèle final.`
    : ''),
  lead: (c) => spec([
    ['Modèle final', `Le modèle final est entraîné sur les ${c.learnCount} élèves
      d'apprentissage. Ses ${c.houseCount} descentes s'arrêtent aux itérations ${c.stops}.${c.crossValidation
      ? ` Son exactitude attendue est celle de la validation croisée, ${c.cvAccuracy}&nbsp;%.` : ''}`],
    ['Élèves réservés', `Les médianes, μ, σ et les poids ont été calculés sans les
      ${c.testCount} élèves réservés.`],
    ['Calcul', `Leurs notes sont complétées par les médianes, puis standardisées avec les μ et
      σ des élèves d'apprentissage. Chacun des ${c.houseCount} modèles calcule ensuite leur
      score. Chaque élève reçoit la maison du plus grand score.`],
    ['Maison réelle', 'La maison réelle de ces élèves est connue dans ce jeu. Elle ne sert qu\'à contrôler les réponses.'],
    ['Résultat', `${c.testCorrect} sur ${c.testCount}
      ${plural(c.testCorrect, 'est bien classé', 'sont bien classés')}.`, true],
  ]),
  more: () => `
    <p>Si μ et σ étaient recalculés sur les élèves réservés, l'échelle des variables
    changerait, et les poids appris à l'échelle des élèves d'apprentissage ne conviendraient
    plus. Le modèle enregistre donc les médianes, les moyennes et les écarts types avec ses
    poids.</p>`,
};
