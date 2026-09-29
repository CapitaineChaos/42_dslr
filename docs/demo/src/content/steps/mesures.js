// Matrice de confusion et scores

import { spec } from './format.js';

export default {
  id: 'mesures',
  node: 'decision',
  phase: 'post',
  plot: 'frontiere',
  title: 'Matrice de confusion et scores',
  math: 'P_h = \\dfrac{\\text{bien classés en } h}{\\text{classés en } h} \\qquad R_h = \\dfrac{\\text{bien classés en } h}{\\text{élèves de } h} \\qquad F_1 = \\dfrac{2PR}{P + R}',
  calc: { group: 'train', cols: ['name', 'house', 'hmax'], matrix: 'train' },
  lead: (c) => spec([
    ['Matrice', `Une ligne par maison réelle, une colonne par maison attribuée. La diagonale
      compte les élèves bien classés ; toute autre case, une confusion entre deux maisons.`],
    ['Scores', `Pour chaque maison, la précision P est la part de ses élèves parmi ceux qui y
      sont classés, lue sur sa colonne ; le rappel R, la part de ses élèves qui y sont classés,
      lue sur sa ligne ; F1, leur moyenne harmonique, n'est élevé que si les deux le sont.`],
    ['Pourquoi', `L'exactitude globale masque les maisons mal servies : une petite maison
      toujours confondue avec une autre ne coûte que quelques points d'exactitude, mais son
      rappel tombe à 0.`],
    ['Résultat', `${c.trainText}. Exactitude ${c.trainReport.accuracy}.`, true],
  ]),
  more: () => `
    <p>Ces mesures portent sur les élèves d'entraînement, sur lesquels les poids ont été
    ajustés : elles surestiment ce que les modèles obtiendraient sur des élèves nouveaux. La
    validation calcule les mêmes scores sur les élèves mis de côté.</p>
    <p>Lorsqu'aucun élève n'est classé dans une maison, sa précision vaut 0/0 : elle est
    indéfinie, affichée par un tiret, et comptée 0 dans le calcul, de même que son F1.</p>`,
};
