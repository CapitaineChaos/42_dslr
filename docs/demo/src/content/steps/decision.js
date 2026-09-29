// Décision : la maison du plus grand score

import { spec } from './format.js';

export default {
  id: 'decision',
  node: 'decision',
  phase: 'post',
  plot: 'frontiere',
  title: 'Décision : la maison du plus grand score',
  math: '\\hat{h}_i = \\operatorname*{arg\\,max}_{h} \; z_{h,i}',
  calc: { group: 'train', cols: ['name', 'house', 'z0', 'z1', 'z2', 'hmax'], worked: 'argmax' },
  lead: (c) => spec([
    ['Trois scores', `Les ${c.houseCount} descentes terminées, chaque élève reçoit un score de
      chaque modèle : ${c.houses.map((name) => `z<sub>${name[0]}</sub>`).join(', ')}.`],
    ['Règle', `L'élève est attribué à la maison dont le modèle donne le plus grand score.
      σ étant croissante, c'est aussi la maison de plus grande probabilité.`],
    ['Pourquoi comparer', `Les modèles ont été entraînés séparément : leurs probabilités ne
      somment pas à 1. Un élève peut n'être revendiqué par aucun modèle, toutes ses
      probabilités sous 0.5, ou par deux à la fois. Le plus grand score tranche dans tous
      les cas.`],
    ['Résultat', `${c.trainCorrect} élèves d'entraînement sur ${c.n} reçoivent leur maison
      réelle. Sur la figure, le plan est partagé entre les ${c.houseCount} maisons.`, true],
  ]),
  more: (c) => `
    <p>La frontière entre deux maisons est l'ensemble des points où leurs deux scores sont
    égaux : z<sub>h</sub> − z<sub>k</sub> = 0, une droite. Les régions de la figure sont donc
    des polygones convexes, délimités par des morceaux de ces droites, et non par les
    droites z = 0 de chaque modèle.</p>
    <p>Avec deux maisons seulement, le second modèle aurait exactement les poids opposés du
    premier, et la règle reviendrait à p &gt; 0.5. À partir de ${c.houseCount} maisons, elle
    n'a plus d'équivalent sous forme de seuil.</p>`,
};
