import { plural, spec } from './format.js';

const misclassified = (c) => {
  const count = c.n - c.trainCorrect;
  if (!count) return 'Aucun élève n\'est mal classé.';
  return `${count} ${plural(count, 'élève est mal classé', 'élèves sont mal classés')}
    sur ${c.n} : ${c.trainText}.`;
};

export default {
  id: 'erreurs',
  node: 'decision',
  phase: 'post',
  plot: 'frontiere',
  title: 'Élèves mal classés',
  math: null,
  calc: { group: 'train', cols: ['name', 'house', 'x1', 'x2', 'z0', 'z1', 'z2', 'hmax'] },
  lead: (c) => spec([
    ['Résultat', misclassified(c), true],
    ['Position', `Les élèves mal classés, cerclés dans le plan des notes, se trouvent là où
      les maisons se recouvrent.`],
    ['Cause', `Un modèle ne trace qu'une droite. Il ne peut pas isoler une maison dont les
      élèves sont entre deux autres maisons ou les chevauchent, et aucun jeu de poids ne
      classe alors correctement tous les élèves.`],
    ['Limite', `D'autres matières, ou des combinaisons de notes, donneraient d'autres
      directions de séparation. Avec deux notes et des frontières droites, ces erreurs
      restent.`],
  ]),
  more: () => `
    <p>Une frontière qui placerait ces élèves du bon côté ferait basculer leurs voisins. Le
    minimum de J des modèles concernés est donc strictement positif.</p>`,
};
