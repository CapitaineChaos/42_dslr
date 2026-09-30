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
    ['Décisions hors pli', `Chaque élève d'apprentissage a été classé une fois, par les modèles
      entraînés sans son pli.`],
    ['Exactitude hors pli', `L'exactitude hors pli estime l'exactitude du modèle final sur des
      élèves nouveaux. Les modèles des plis ne servent qu'à cette estimation. La prédiction
      utilise les modèles du passage final, entraînés sur les ${c.learnCount} élèves.`],
  ]),
  more: (c) => `
    <p>Avec ${c.learnCount} élèves, un seul découpage entre entraînement et test laisserait
    très peu d'élèves pour mesurer l'exactitude. Le résultat dépendrait aussi du découpage
    choisi.</p>`,
};
