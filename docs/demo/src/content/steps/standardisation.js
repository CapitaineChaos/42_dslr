import { S } from '../symbols.js';
import { spec } from './format.js';

export default {
  id: 'standardisation',
  node: 'echelle',
  phase: 'prep',
  plot: 'frontiere',
  title: 'Standardisation',
  math: 'x_{ij} \\leftarrow \\dfrac{x_{ij} - \\mu_j}{\\sigma_j}',
  calc: { group: 'train', cols: ['name', 'house', 'raw0', 'x1', 'raw1', 'x2'], worked: 'scale' },
  lead: (c) => spec([
    ['Notation', `${S.mu} et ${S.sd} sont la moyenne et l'écart type de la matière. ${S.x1} est
      la note de ${c.label0} standardisée, ${S.x2} celle de ${c.label1}.`],
    ['Paramètres', `${c.label0} : μ = ${c.mu0}, σ = ${c.sd0}. ${c.label1} : μ = ${c.mu1},
      σ = ${c.sd1}. Ces paramètres sont calculés sur ${c.trainers}, puis appliqués tels
      quels ${c.outside}.`],
    ['Conditionnement', `Les deux notes n'ont pas la même échelle. Sans standardisation, la
      hessienne de J est mal conditionnée. Un pas α stable dans la direction la plus courbée
      est alors trop petit dans l'autre, et la descente est lente.`],
  ]),
  more: () => '',
};
