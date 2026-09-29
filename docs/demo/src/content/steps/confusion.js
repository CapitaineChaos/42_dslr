// Matrice de confusion hors pli

import { spec } from './format.js';

export default {
  id: 'confusion',
  node: 'validation',
  phase: 'valid',
  plot: null,
  title: 'Matrice de confusion hors pli',
  math: 'P_h = \\dfrac{\\text{bien classés en } h}{\\text{classés en } h} \\qquad R_h = \\dfrac{\\text{bien classés en } h}{\\text{élèves de } h} \\qquad F_1 = \\dfrac{2PR}{P + R}',
  calc: { matrix: 'cv' },
  lead: (c) => spec([
    ['Décisions', `Les ${c.learnCount} décisions hors pli sont réunies dans une seule matrice.
      Chaque élève y figure une fois, classé par les modèles entraînés sans son pli.`],
    ['Scores', `Précision, rappel et F1 se calculent pour chaque maison, comme à l'étape
      Décision, mais sur des élèves que les modèles n'avaient pas vus.`],
    ['Résultat', c.cv.houses.map((house) => `${house.name} : P ${house.precision}, R
      ${house.recall}, F1 ${house.f1}`).join('. ') + `. Exactitude ${c.cvAccuracy}&nbsp;%.`],
    ['Lecture', `${c.cv.text[0].toUpperCase()}${c.cv.text.slice(1)}.`],
    ['Suite', `La validation relance l'entraînement une dernière fois, sur les
      ${c.learnCount} élèves, pour obtenir le modèle final.`],
  ]),
  more: () => `
    <p>Les décisions des plis sont additionnées avant le calcul des scores, et non moyennées
    pli par pli : avec cinq élèves par pli, un score calculé sur un seul pli varierait par
    sauts de 20 %.</p>
    <p>F1 = 2PR / (P + R) est la moyenne harmonique de P et R : elle reste proche du plus
    petit des deux, et un rappel faible ne peut pas être compensé par une précision
    élevée.</p>`,
};
