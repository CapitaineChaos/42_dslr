import { spec } from './format.js';

export default {
  id: 'confusion',
  node: 'validation',
  phase: 'valid',
  plot: null,
  title: 'Matrice de confusion hors pli',
  math: 'P_h = \\dfrac{\\text{bien classés en } h}{\\text{classés en } h} \\qquad R_h = \\dfrac{\\text{bien classés en } h}{\\text{élèves de } h} \\qquad F_1 = \\dfrac{2PR}{P + R}',
  calc: { matrix: 'cv' },
  intro: () => `Les décisions hors pli sont réunies dans une seule matrice. Elle donne les mêmes
    mesures qu'à l'étape Décision, cette fois sur des élèves que les modèles n'ont pas vus.`,
  lead: (c) => spec([
    ['Somme des plis', `Les décisions des ${c.k} plis sont sommées dans une seule matrice, sur
      laquelle les scores sont calculés. Les scores ne sont pas moyennés par pli. Avec
      environ cinq élèves par pli, un score calculé sur un seul pli varierait par sauts de
      20 %.`],
  ]),
  more: () => `
    <p>F1 est la [[moyenne-harmonique|moyenne harmonique]] de \\(P\\) et \\(R\\). Elle reste proche du plus petit des deux,
    donc une précision élevée ne compense pas un rappel faible.</p>`,
};
