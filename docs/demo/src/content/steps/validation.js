import { spec } from './format.js';

export default {
  id: 'validation',
  node: 'validation',
  phase: 'valid',
  plot: null,
  title: 'Bilan de la validation croisée',
  math: null,
  calc: { group: 'learn', cols: ['name', 'house', 'fold', 'cvpred'], footer: 'folds', worked: ['cvtotal', 'fold'] },
  intro: (c) => `Un pli d'environ cinq élèves donne une mesure très variable. En réunissant les
    ${c.k} plis, chaque élève d'apprentissage est classé une fois, par des modèles entraînés
    sans lui.`,
  lead: (c) => spec([
    ['Exactitude hors pli', `L'exactitude hors pli estime l'exactitude du modèle final sur des
      élèves nouveaux. Les modèles des plis ne servent qu'à cette estimation. La prédiction
      utilise les modèles du passage final, entraînés sur les ${c.learnCount} élèves.`],
  ]),
  more: (c) => `
    <p>Avec ${c.learnCount} élèves, un seul découpage entre entraînement et test laisserait
    très peu d'élèves pour mesurer l'exactitude. Le résultat dépendrait aussi du découpage
    choisi.</p>`,
};
