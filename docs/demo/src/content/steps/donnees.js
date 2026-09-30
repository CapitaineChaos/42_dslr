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
    ['Élèves', `Le jeu compte ${c.learnCount} élèves d'apprentissage, dont la maison est connue,
      et ${c.testCount} élèves réservés, dont le modèle final prédit la maison.`],
    c.crossValidation && ['Plis', `Les ${c.learnCount} élèves d'apprentissage sont répartis en
      ${c.k} plis stratifiés par maison, de ${c.foldSizes}.`],
    ['Notes', `Chaque élève a une note de ${c.label0} sur ${c.max0} et une note de ${c.label1}
      sur ${c.max1}. Il manque ${c.allMissing} notes.`],
    ['Maisons', `La classe à prédire est la maison : ${c.houseList}.`],
  ].filter(Boolean)),
  more: (c) => (c.crossValidation
    ? `<p>Dans chaque passage, les médianes, les moyennes, les écarts types et les poids sont
      calculés sur les seuls élèves d'entraînement, sans le pli mis de côté ni les élèves
      réservés.</p>`
    : `<p>Les médianes, les moyennes, les écarts types et les poids sont calculés sur les seuls
      élèves d'apprentissage, sans les élèves réservés.</p>`),
};
