// Imputation par la médiane

import { spec } from './format.js';

export default {
  id: 'imputation',
  node: 'mediane',
  phase: 'prep',
  plot: 'frontiere',
  title: 'Imputation par la médiane',
  math: 'm_j = \\text{médiane}\\{\\,x_{ij} : x_{ij}\\ \\text{présente}\\,\\}',
  calc: { group: 'train', cols: ['name', 'house', 'raw0', 'raw1'], worked: 'impute' },
  lead: (c) => spec([
    ['Constat', c.missing.length
      ? `${c.missing.map((m) => `${m.name} n'a pas de note de ${m.label}`).join(', et ')}.
         Sans ces valeurs, leur score ne peut pas être calculé.`
      : `Aucune note ne manque parmi ${c.trainers} : les élèves dont une note est absente
         sont dans le pli mis de côté.`],
    ['Calcul', `Chaque note absente est remplacée par la médiane des notes présentes de la même
      matière, calculée sur ${c.trainers} : ${c.median0} en ${c.label0},
      ${c.median1} en ${c.label1}. Les valeurs imputées sont signalées dans le tableau.`],
    ['Pourquoi la médiane', `La médiane ne dépend que du rang des valeurs : une note extrême la
      déplace d'une position au plus, alors qu'elle déplace la moyenne en proportion de son
      écart.`],
    ['Ordre', 'L\'imputation précède la standardisation : μ et σ sont calculés sur les colonnes complétées.'],
  ]),
  more: (c) => `
    <p>Pour une colonne de n valeurs présentes, rangées par ordre croissant, la médiane est
    la valeur centrale si n est impair, et la moyenne des deux valeurs centrales si n est
    pair.</p>
    <p>Imputer par la médiane conserve la valeur centrale de la colonne mais réduit
    légèrement sa dispersion, puisque la note ajoutée se place au centre. Avec
    ${c.missing.length} valeurs imputées sur ${c.n * 2}, l'effet sur σ est négligeable.</p>`,
};
