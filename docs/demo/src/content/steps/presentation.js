import { spec } from './format.js';

const WORDS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six'];

export default {
  id: 'presentation',
  node: 'presentation',
  phase: 'intro',
  plot: null,
  title: 'Régression logistique',
  math: 'p = \\sigma\\Big(w_0 + \\sum_{j=1}^{d} w_j\\, x_j\\Big)',
  calc: null,
  lead: (c) => spec([
    ['dslr', `Le projet dslr attribue une maison à un élève d'après ses notes, par
      [[regression-logistique|régression logistique]] [[un-contre-tous|un contre tous]]. Il entraîne ses modèles sur 1 600 élèves répartis en 4 maisons, avec d = 10
      des 13 matières.`],
    ['Notation', `p est la probabilité qu'un élève soit d'une maison, x<sub>j</sub> sa note dans la
      matière j, w<sub>j</sub> le poids de cette matière et σ la [[sigmoide|sigmoïde]].`],
    ['Jeu réduit', `Les mêmes méthodes sont appliquées ici à ${c.total} élèves, ${c.houseCount}
      maisons et d = 2 matières. Avec 2 matières, un élève est un point du plan et une frontière
      est une droite.`],
    ['Boucle de correction', `Une [[iteration|itération]] calcule les scores, les probabilités,
      la [[perte]] de chaque élève, leur moyenne, appelée [[cout|coût]], et le [[gradient]] du
      coût, puis met à jour les poids. La boucle s'arrête quand le
      [[critere-arret|critère d'arrêt]] est satisfait, ou après ${c.maxIter} itérations.`],
    ['Boucle des maisons', `La boucle de correction est exécutée une fois par maison, avec les
      étiquettes de cette maison, ce qui donne ${c.houseCount} modèles.`],
    c.crossValidation && ['Boucle des plis', `La [[validation-croisee|validation croisée]] exécute l'entraînement
      ${c.k} fois. Chaque passage met un pli de côté, refait la préparation et l'entraînement
      sur les autres élèves, puis classe les élèves de ce pli.`],
    ['Modèle final', `${c.crossValidation ? 'Un dernier' : 'Un seul'} passage entraîne le modèle
      final sur les ${c.learnCount} élèves d'apprentissage. Ce modèle prédit la maison des
      ${c.testCount} élèves réservés.`],
  ].filter(Boolean)),
  more: (c) => `
    <p><code>logreg_train</code> remplace les notes absentes par la médiane, standardise les
    notes, puis entraîne un modèle par maison.${c.crossValidation ? ` <code>cross_validation</code>
    répète cet entraînement sur ${WORDS[c.k]} plis [[stratification|stratifiés]] et en tire
    une [[matrice-confusion|matrice de confusion]] et des scores par maison.` : ''} <code>logreg_predict</code> prépare les notes
    des nouveaux élèves avec les paramètres enregistrés à l'entraînement, puis attribue à
    chacun la maison du plus grand score.</p>
    ${c.crossValidation ? `<p>dslr mélange les élèves de chaque maison avant de former les
    plis. Ici, les plis suivent l'ordre du fichier.</p>` : ''}`,
};
