// Régression logistique, calcul par calcul

import { spec } from './format.js';

export default {
  id: 'presentation',
  node: 'presentation',
  phase: 'intro',
  plot: null,
  title: 'Régression logistique, calcul par calcul',
  math: 'p = \\sigma(w_0 + w_1 x_1 + w_2 x_2)',
  calc: null,
  lead: (c) => spec([
    ['Objet', `Cette démonstration déroule la méthode du projet dslr : prédire la maison d'un
      élève à partir de ses notes, par régression logistique.`],
    ['Le projet', `dslr répartit 1 600 élèves entre quatre maisons à partir de leurs notes dans
      dix matières. Il entraîne un modèle par maison, qui sépare cette maison de toutes les
      autres, et attribue à chaque élève la maison dont le modèle donne le plus grand
      score.`],
    ['Réduction', `Ici, ${c.total} élèves, ${c.houseCount} maisons, deux matières. Deux
      matières placent chaque élève dans un plan, où les frontières se voient ; ${c.total}
      élèves se suivent un par un. Les méthodes restent celles du projet : imputation par la
      médiane, standardisation, un modèle par maison entraîné par descente de gradient,
      critère d'arrêt, maison du plus grand score, validation croisée à ${c.k} plis
      stratifiés, modèle final, prédiction.`],
    ['Boucle de correction', `Score, probabilité, perte, gradient, mise à jour : ce cycle
      corrige les poids d'un modèle et se répète jusqu'au critère d'arrêt, ou jusqu'à la
      limite de ${c.maxIter} itérations. Dans le schéma, c'est la flèche de retour sous ces
      cinq nœuds.`],
    ['Boucle des maisons', `Un contre tous : la boucle de correction est exécutée une fois par
      maison, chaque fois avec d'autres étiquettes, pour obtenir ${c.houseCount} modèles.
      Dans le schéma, c'est la seconde flèche de retour sous la ligne, de l'arrêt à
      Maison.`],
    ['Boucle des plis', `La validation croisée exécute tout l'entraînement ${c.k} fois, en
      mettant chaque fois un pli d'élèves de côté pour l'évaluer. Dans le schéma, c'est la
      flèche de retour au-dessus, de Validation à Médiane. Un dernier passage, sur les
      ${c.learnCount} élèves d'apprentissage, produit le modèle final, qui prédit la maison
      des ${c.testCount} élèves réservés.`],
    ['Pourquoi', `Le programme effectue ces calculs en quelques opérations matricielles sur
      tous les élèves à la fois. Les dérouler sur un petit groupe montre ce que calcule chaque
      opération, et pourquoi elle est nécessaire.`],
  ]),
  moreTitle: 'Correspondance avec dslr',
  more: (c) => `
    ${spec([
      ['Médiane → décision', 'logreg_train : préparation des notes, puis un modèle par maison.'],
      ['Validation', `cross_validation : ${c.k} plis stratifiés, matrice de confusion et scores par maison.`],
      ['Prédiction', 'logreg_predict : même préparation, avec les paramètres enregistrés, puis la maison du plus grand score.'],
      ['Écarts', `${c.houseCount} maisons au lieu de quatre ; deux matières au lieu de dix ;
        plis formés dans l'ordre des élèves, et non après un tirage aléatoire.`],
    ])}`,
};
