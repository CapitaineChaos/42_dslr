import { spec } from './format.js';

export default {
  id: 'mesures',
  node: 'decision',
  phase: 'post',
  plot: 'frontiere',
  title: 'Matrice de confusion et scores',
  math: 'P_h = \\dfrac{\\text{bien classés en } h}{\\text{classés en } h} \\qquad R_h = \\dfrac{\\text{bien classés en } h}{\\text{élèves de } h} \\qquad F_1 = \\dfrac{2PR}{P + R}',
  calc: { group: 'train', cols: ['name', 'house', 'hmax'], matrix: 'train' },
  lead: () => spec([
    ['Matrice', `La matrice a une ligne par maison réelle et une colonne par maison
      attribuée. P<sub>h</sub> est le terme diagonal de h divisé par la somme de sa colonne,
      R<sub>h</sub> le même terme divisé par la somme de sa ligne.`],
    ['Exactitude', `L'exactitude ne distingue pas les maisons. Si une petite maison est
      toujours confondue avec une autre, l'exactitude ne baisse que de quelques points alors
      que le rappel de cette maison tombe à 0.`],
  ]),
  more: (c) => `
    <p>Ces mesures portent sur les élèves d'entraînement, sur lesquels les poids ont été
    ajustés. Elles surestiment le résultat sur des élèves nouveaux.${c.crossValidation
    ? ' La validation calcule les mêmes scores sur les élèves mis de côté.' : ''}</p>
    <p>Quand aucun élève n'est classé dans une maison, sa précision vaut 0/0. Elle est
    notée « — » ici. dslr la compte pour 0, ainsi que le F1 de la maison.</p>`,
};
