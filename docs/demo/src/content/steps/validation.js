// Bilan de la validation croisée

import { spec } from './format.js';

export default {
  id: 'validation',
  node: 'validation',
  phase: 'valid',
  plot: null,
  title: 'Bilan de la validation croisée',
  math: null,
  calc: { group: 'learn', cols: ['name', 'house', 'fold', 'cvpred'], footer: 'folds', worked: 'fold' },
  lead: (c) => spec([
    ['Principe', `L'entraînement a été exécuté une fois par pli, chaque fois sur les autres plis,
      et les modèles de chaque passage ont classé les élèves de leur pli, qu'ils n'avaient
      jamais vus.`],
    ['Résultat', `Chaque élève d'apprentissage a donc été classé une fois, par des modèles qui
      ne l'avaient pas vu. ${c.cvCorrect} élèves sur ${c.learnCount} sont bien classés, soit
      une exactitude de ${c.cvAccuracy}&nbsp;%.`],
    ['Usage', `Ce chiffre estime l'exactitude du modèle final sur des élèves nouveaux. Les
      modèles de validation sont ensuite abandonnés : seuls ceux du modèle final, entraînés
      sur les ${c.learnCount} élèves, servent à la prédiction.`],
  ]),
  more: (c) => `
    <p>Avec ${c.learnCount} élèves, un découpage unique entre entraînement et test laisserait
    très peu d'élèves pour mesurer l'exactitude, et le résultat dépendrait du découpage
    choisi. La validation croisée utilise chaque élève une fois comme élève de test.</p>
    <p>Les médianes, μ et σ sont recalculés dans chaque pli, sur ses seuls élèves
    d'entraînement : aucune information sur les élèves testés n'entre dans les modèles qui
    les classent.</p>`,
};
