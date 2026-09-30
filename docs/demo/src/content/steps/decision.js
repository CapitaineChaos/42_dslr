import { spec } from './format.js';

export default {
  id: 'decision',
  node: 'decision',
  phase: 'post',
  plot: 'frontiere',
  title: 'Maison du plus grand score',
  math: '\\hat{h}_i = \\operatorname*{arg\\,max}_{h} \; z_{h,i}',
  calc: { group: 'train', cols: ['name', 'house', 'z0', 'z1', 'z2', 'hmax'], worked: 'argmax' },
  lead: (c) => spec([
    ['Scores', `Après les ${c.houseCount} descentes, chaque élève a un score par modèle :
      ${c.houses.map((name) => `z<sub>${name[0]}</sub>`).join(', ')}.`],
    ['Probabilités', `Comme σ est croissante, la maison du plus grand score est aussi celle
      de la plus grande probabilité. Les modèles sont entraînés séparément, donc leurs
      probabilités ne somment pas à 1. Un élève peut avoir toutes ses probabilités sous 0.5,
      ou deux au-dessus, et le plus grand score désigne une maison dans tous les cas.`],
    ['Résultat', `${c.trainCorrect} élèves d'entraînement sur ${c.n} reçoivent leur maison
      réelle.`, true],
  ]),
  more: (c) => `
    <p>La frontière entre deux maisons est l'ensemble des points où leurs scores sont
    égaux, z<sub>h</sub> − z<sub>k</sub> = 0. C'est une droite. Les régions sont donc
    des polygones convexes, limités par des segments de ces droites. Les droites
    z = 0 de chaque modèle ne sont pas ces frontières.</p>
    <p>Avec deux maisons, le second modèle aurait les poids opposés du premier, et la règle
    reviendrait à p &gt; 0.5. À partir de ${c.houseCount} maisons, la règle ne se ramène
    plus à un seuil.</p>`,
};
