import { S } from '../symbols.js';
import { spec } from './format.js';

export default {
  id: 'etiquettes',
  node: 'maison',
  phase: 'maison',
  plot: 'frontiere',
  title: 'Un modèle par maison',
  math: 'y_i = \\begin{cases} 1 & \\text{si l\'élève } i \\text{ est de la maison } h \\\\ 0 & \\text{sinon} \\end{cases}',
  calc: { group: 'train', cols: ['name', 'house', 'y'], worked: 'labels' },
  lead: (c) => spec([
    ['Un contre tous', `La régression logistique est binaire. Pour ${c.houseCount} maisons,
      l'entraînement produit ${c.houseCount} modèles, et chacun oppose sa maison aux autres.`],
    ['Étiquettes', `Pour le modèle de ${c.house}, ${S.y} = 1 pour ses ${c.positives} élèves et
      y = 0 pour les ${c.n - c.positives} élèves de ${c.others}. Les ${c.houseCount} modèles
      utilisent les mêmes notes standardisées et ne diffèrent que par les étiquettes.`],
    [`maison ${c.houseIndex + 1} sur ${c.houseCount}`, `Les poids du modèle de ${c.house} sont
      initialisés à 0.`, true],
  ]),
  more: () => `
    <p>Une maison située entre deux autres dans le plan des notes n'est pas séparable des
    autres par une droite. Son modèle garde des élèves mal placés, mais la règle du plus
    grand score lui attribue quand même une région.</p>`,
};
