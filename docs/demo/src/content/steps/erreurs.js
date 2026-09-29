// Élèves mal classés

import { plural, spec } from './format.js';

export default {
  id: 'erreurs',
  node: 'decision',
  phase: 'post',
  plot: 'frontiere',
  title: 'Élèves mal classés',
  math: null,
  calc: { group: 'train', cols: ['name', 'house', 'x1', 'x2', 'z0', 'z1', 'z2', 'hmax'] },
  lead: (c) => spec([
    ['Résultat', `${c.n - c.trainCorrect} ${plural(c.n - c.trainCorrect, 'élève est mal classé', 'élèves sont mal classés')}
      sur ${c.n} : ${c.trainText}.`, true],
    ['Position', `Sur la figure, ils sont cerclés : chacun se trouve dans la région d'une autre
      maison, là où les notes des maisons se recouvrent.`],
    ['Cause', `Chaque modèle trace une seule droite. Une maison dont les élèves s'étendent
      entre deux autres, ou les chevauchent, ne peut pas être isolée : aucun jeu de poids ne
      classe alors correctement tous les élèves.`],
    ['Limite', `Plus de matières, ou des combinaisons de notes, donneraient d'autres directions
      de séparation ; avec deux notes et des frontières droites, ces erreurs subsistent.`],
  ]),
  more: () => `
    <p>Une frontière qui placerait ces élèves du bon côté ferait basculer leurs voisins
    immédiats. C'est la traduction géométrique du minimum strictement positif de J pour les
    modèles concernés.</p>`,
};
