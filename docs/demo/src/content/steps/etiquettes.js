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
  intro: (c) => `La régression logistique ne distingue que
    [[classification-binaire|deux classes]]. Avec ${c.houseCount}
    maisons, l'entraînement construit un modèle binaire par maison, qui oppose les élèves de
    cette maison à tous les autres.`,
  lead: (c) => spec([
    ['Étiquettes', `Pour le modèle de ${c.house}, ${S.y} = 1 pour ses ${c.positives} élèves et
      y = 0 pour les ${c.n - c.positives} élèves de ${c.others}. Les ${c.houseCount} modèles
      utilisent les mêmes notes standardisées et ne diffèrent que par les étiquettes.`],
    [`maison ${c.houseIndex + 1} sur ${c.houseCount}`, `Les poids du modèle de ${c.house} sont
      initialisés à 0.`, true],
  ]),
  more: () => `
    <p>Une maison située entre deux autres dans le plan des notes n'est pas
    [[separabilite|séparable]] des autres par une droite. Son modèle garde des élèves mal placés, mais la règle du plus
    grand score lui attribue quand même une région.</p>
    <p>Une autre méthode, la [[regression-multinomiale|régression multinomiale]], entraîne un seul modèle qui donne
    directement une probabilité par maison, et ces probabilités somment à 1. dslr utilise un
    contre tous, dont chaque modèle est la régression binaire des étapes suivantes.</p>`,
};
