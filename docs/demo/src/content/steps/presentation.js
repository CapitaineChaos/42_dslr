import { spec } from './format.js';

const WORDS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six'];

export default {
  id: 'presentation',
  node: 'presentation',
  phase: 'intro',
  plot: null,
  title: 'Régression logistique',
  math: 'p = \\sigma(w_0 + w_1 x_1 + w_2 x_2)',
  calc: null,
  lead: (c) => spec([
    ['dslr', `Le projet dslr attribue une maison à un élève d'après ses notes, par régression logistique
      un contre tous. Il entraîne ses modèles sur 1 600 élèves répartis en 4 maisons, avec 10
      des 13 matières.`],
    ['Jeu réduit', `Les mêmes méthodes sont appliquées ici à ${c.total} élèves, ${c.houseCount}
      maisons et 2 matières. Avec 2 matières, un élève est un point du plan et une frontière
      est une droite.`],
    ['Boucle de correction', `Une itération calcule les scores, les probabilités, la perte et
      le gradient, puis met à jour les poids. La boucle s'arrête quand le critère d'arrêt est
      satisfait, ou après ${c.maxIter} itérations.`],
    ['Boucle des maisons', `La boucle de correction est exécutée une fois par maison, avec les
      étiquettes de cette maison, ce qui donne ${c.houseCount} modèles.`],
    c.crossValidation && ['Boucle des plis', `La validation croisée exécute l'entraînement
      ${c.k} fois. Chaque passage met un pli de côté, refait la préparation et l'entraînement
      sur les autres élèves, puis classe les élèves de ce pli.`],
    ['Modèle final', `${c.crossValidation ? 'Un dernier' : 'Un seul'} passage entraîne le modèle
      final sur les ${c.learnCount} élèves d'apprentissage. Ce modèle prédit la maison des
      ${c.testCount} élèves réservés.`],
  ].filter(Boolean)),
  moreTitle: 'Correspondance avec dslr',
  more: (c) => `
    <p><code>logreg_train</code> remplace les notes absentes par la médiane, standardise les
    notes, puis entraîne un modèle par maison.${c.crossValidation ? ` <code>cross_validation</code>
    répète cet entraînement sur ${WORDS[c.k]} plis stratifiés et en tire une matrice de
    confusion et des scores par maison.` : ''} <code>logreg_predict</code> prépare les notes
    des nouveaux élèves avec les paramètres enregistrés à l'entraînement, puis attribue à
    chacun la maison du plus grand score.</p>
    ${c.crossValidation ? `<p>dslr mélange les élèves de chaque maison avant de former les
    plis. Ici, les plis suivent l'ordre du fichier.</p>` : ''}`,
};
