// Standardisation

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
    ['Calcul', `Chaque note est remplacée par son écart à la moyenne de la matière, exprimé en
      écarts types : ${S.x1} = (note de ${c.label0} − ${S.mu}) / ${S.sd}, et de même ${S.x2}
      pour ${c.label1}.`],
    ['Paramètres', `${c.label0} : μ = ${c.mu0}, σ = ${c.sd0}. ${c.label1} : μ = ${c.mu1},
      σ = ${c.sd1}. Ces valeurs sont calculées sur ${c.trainers}, puis appliquées telles
      quelles ${c.outside}.`],
    ['Pourquoi', `Les deux notes n'ont pas la même échelle. Or la mise à jour retire à chaque
      poids la même fraction α de sa dérivée : sans standardisation, ce pas serait trop grand
      pour une variable et trop petit pour l'autre, et la descente oscillerait ou
      stagnerait.`],
    ['Résultat', 'Les deux variables ont une moyenne nulle et un écart type égal à 1. Une valeur de 1 désigne une note supérieure d\'un écart type à la moyenne.'],
  ]),
  more: () => `
    <p>Sans standardisation, les lignes de niveau de J dans l'espace des poids sont des
    ellipses très allongées : la hessienne de J est mal conditionnée. Un pas α adapté à la
    direction la plus courbée est alors beaucoup trop petit pour l'autre, et la descente
    progresse lentement ou oscille.</p>
    <p>Après standardisation, les deux variables ont la même échelle, et un pas unique
    convient aux deux directions. Les paramètres μ et σ sont enregistrés avec le modèle :
    la prédiction applique exactement la même transformation.</p>`,
};
