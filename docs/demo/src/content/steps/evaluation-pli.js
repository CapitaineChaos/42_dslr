import { plural, spec } from './format.js';

export default {
  id: 'evaluation-pli',
  node: 'validation',
  phase: 'valid',
  plot: 'frontiere',
  title: 'Évaluation du pli',
  math: null,
  calc: { group: 'held', cols: ['name', 'house', 'x1', 'x2', 'z0', 'z1', 'z2', 'hmax'], worked: 'argmax' },
  intro: () => `Mesuré sur ses propres élèves d'entraînement, un modèle paraît meilleur qu'il
    n'est ([[surapprentissage]]). Les élèves du pli mis de côté servent de test, car ils n'ont servi à aucun calcul du
    passage.`,
  lead: (c) => spec([
    ['Élèves du pli', `Les ${c.heldCount} élèves du pli ${c.pli + 1} ont été écartés de tout le
      passage. La médiane, μ, σ et les poids des ${c.houseCount} modèles ne dépendent pas
      d'eux.`],
    ['Calcul', `Leurs notes sont complétées et standardisées avec les paramètres du passage.
      Chacun des ${c.houseCount} modèles, pris à son arrêt, calcule ensuite leur score. Chaque
      élève reçoit la maison du plus grand score.`],
    ['Résultat', `${c.heldCorrect} sur ${c.heldCount} ${plural(c.heldCorrect, 'est bien classé', 'sont bien classés')}.`, true],
  ]),
  more: () => '',
};
