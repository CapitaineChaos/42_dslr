// Un modèle par maison

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
    ['Principe', `La régression logistique sépare deux classes. Pour ${c.houseCount} maisons, le
      projet entraîne ${c.houseCount} modèles, un par maison : chacun oppose sa maison à toutes
      les autres. C'est la méthode un contre tous.`],
    ['Étiquettes', `Pour le modèle de ${c.house}, ${S.y} = 1 pour ses ${c.positives} élèves et
      y = 0 pour les ${c.n - c.positives} élèves de ${c.others}. Les notes préparées sont les
      mêmes pour les ${c.houseCount} modèles ; seules les étiquettes changent.`],
    [`maison ${c.houseIndex + 1} sur ${c.houseCount}`, `Modèle de ${c.house}. Ses poids partent de
      0 et sa descente suit la boucle de correction jusqu'à son propre arrêt.`, true],
    ['Suite', c.houseIndex + 1 < c.houseCount
      ? `À l'arrêt, la boucle des maisons reprend ici avec ${c.houses[c.houseIndex + 1]}.`
      : 'À l\'arrêt, les trois modèles sont entraînés : suit la décision.'],
  ]),
  more: (c) => `
    <p>Chaque modèle ne voit qu'une question binaire : cet élève est-il de ma maison ? Il
    ignore comment les autres se répartissent entre elles. C'est la décision, après la
    boucle, qui compare les ${c.houseCount} réponses.</p>
    <p>Une maison placée entre deux autres dans le plan des notes ne peut pas être isolée
    par une seule droite : son modèle reste imprécis, et c'est la comparaison des scores qui
    lui délimite une région.</p>`,
};
