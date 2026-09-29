// Données

import { spec } from './format.js';

export default {
  id: 'donnees',
  node: 'donnees',
  phase: 'amont',
  plot: 'frontiere',
  title: 'Données',
  math: null,
  calc: { group: 'all', cols: ['name', 'group', 'fold', 'house', 'raw0', 'raw1'], holes: true },
  lead: (c) => spec([
    ['Élèves', `Le jeu compte ${c.total} élèves. Pour ${c.learnCount} d'entre eux, la maison est
      connue : ce sont les élèves d'apprentissage. Les ${c.testCount} autres sont réservés ; le
      modèle final prédit leur maison à la dernière étape.`],
    ['Plis', `Les ${c.learnCount} élèves d'apprentissage sont répartis en ${c.k} plis de
      ${c.foldSizes}, chacun respectant la proportion des ${c.houseCount} maisons.`],
    ['Variables', `Chaque élève est décrit par deux notes : ${c.label0}, sur ${c.max0}, et
      ${c.label1}, sur ${c.max1}. ${c.allMissing} notes sont absentes ; le tableau les signale
      par un tiret.`],
    ['Maisons', `Chaque élève appartient à l'une des ${c.houseCount} maisons : ${c.houseList}.`],
  ]),
  more: (c) => `
    <p>Le problème est une classification à ${c.houseCount} classes. La régression logistique
    ne distingue que deux classes : le projet le ramène à ${c.houseCount} problèmes binaires,
    un par maison, dont chaque modèle estime la probabilité qu'un élève appartienne à sa
    maison plutôt qu'à une autre.</p>
    <p>Dans chaque passage, les médianes, les moyennes, les écarts types et les poids sont
    calculés sur les seuls élèves d'entraînement du passage. Les élèves mis de côté, ceux du
    pli comme les élèves réservés, n'interviennent dans aucun de ces calculs.</p>`,
};
