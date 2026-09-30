import { S } from '../symbols.js';
import { spec } from './format.js';

export default {
  id: 'standardisation',
  node: 'echelle',
  phase: 'prep',
  plot: 'frontiere',
  title: 'Standardisation',
  math: 'x_{ij} \\leftarrow \\dfrac{x_{ij} - \\mu_j}{\\sigma_j}',
  calc: { group: 'train', cols: ['name', 'house', 'raw0', 'x1', 'raw1', 'x2'], worked: ['moments', 'scale'] },
  intro: (c) => `Les notes de ${c.label0} sont sur ${c.max0}, celles de ${c.label1} sur
    ${c.max1}. La standardisation ramène chaque matière à une moyenne nulle et un écart type de
    1, pour qu'aucune échelle ne domine la descente.`,
  lead: (c) => spec([
    ['Notation', `${S.mu} et ${S.sd} sont la [[moyenne]] et l'[[ecart-type|écart type]] de la
      matière j sur les élèves d'entraînement. ${S.x1} est la note de ${c.label0} standardisée, ${S.x2} celle de
      ${c.label1}.`],
    ['Paramètres', `${c.label0} : μ = ${c.mu0}, σ = ${c.sd0}. ${c.label1} : μ = ${c.mu1},
      σ = ${c.sd1}. Ces paramètres sont calculés sur ${c.trainers}, puis appliqués tels
      quels ${c.outside}.`],
    ['Conditionnement', `Les deux notes n'ont pas la même échelle. Sans standardisation, J est
      beaucoup plus courbée dans une direction que dans l'autre, et sa [[hessienne]] est mal
      [[conditionnement|conditionnée]]. Un pas α assez petit pour la direction la plus courbée
      fait alors très peu avancer dans l'autre, et la descente est lente.`],
  ]),
  more: () => String.raw`
    <h4>Moyenne et écart type</h4>
    \[ \mu_j = \frac{1}{n}\sum_{i=1}^{n} x_{ij}, \qquad
       \sigma_j = \sqrt{\frac{1}{n}\sum_{i=1}^{n} (x_{ij} - \mu_j)^2} \]
    <p>L'écart type est celui de la population, divisé par \(n\) et non par \(n - 1\), comme
    dans <code>fit_scaler</code> de dslr.</p>
    <h4>Conditionnement</h4>
    <p>La courbure de \(J\) est donnée par sa hessienne :</p>
    \[ \nabla^2 J(w) = \frac{1}{n}\sum_{i=1}^{n} p_i\,(1 - p_i)\; x_i\, x_i^{\mathsf T} \]
    <p>Ses [[valeurs-propres|valeurs propres]] \(\lambda\) mesurent la courbure de \(J\) dans chaque direction. La
    descente reste stable si \(\alpha < 2/\lambda_{\max}\). Le long de la direction de plus
    faible courbure, l'écart au minimum diminue d'un facteur proche de
    \(1 - \alpha\lambda_{\min}\) à chaque itération. Une note dont l'écart type est cinq fois
    plus grand crée dans sa direction une courbure environ vingt-cinq fois plus forte. Le pas
    stable est alors petit, et la descente est lente dans les autres directions.</p>`,
};
