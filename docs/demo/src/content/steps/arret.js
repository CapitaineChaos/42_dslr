// Critère d'arrêt

import { at, spec } from './format.js';

export default {
  id: 'arret',
  node: 'maj',
  phase: 'boucle',
  plot: 'perte',
  title: "Critère d'arrêt",
  math: '\\lVert \\nabla J(w^{(t)}) \\rVert < \\varepsilon',
  calc: { group: null, cols: null, worked: 'stop' },
  lead: (c) => spec([
    ['Critère', `La boucle s'arrête lorsque ‖∇J‖ &lt; 10⁻³, le test étant fait avant la mise
      à jour des poids.`],
    ['Pourquoi', `Au minimum de J, le gradient est nul : sa norme mesure l'écart à cette
      condition, quel que soit α.`],
    ['Limite', `Si le critère n'est pas satisfait avant ${c.maxIter} itérations, la boucle
      s'arrête là. Cette limite garantit la fin d'une descente qui ne converge pas.`],
    [at(c), c.t < c.last
      ? `‖∇J‖ vaut ${c.gradNorm}, au-dessus du seuil : la boucle continue.`
      : c.converged
        ? `‖∇J‖ vaut ${c.gradNorm}, sous le seuil : la boucle s'arrête.`
        : `‖∇J‖ vaut encore ${c.gradNorm}, mais la limite de ${c.maxIter} itérations est
           atteinte : la boucle s'arrête.`, true],
    ['Ce modèle', c.converged
      ? `La descente de ${c.house} s'arrête sur le critère, à l'itération ${c.last}.`
      : `La descente de ${c.house} s'arrête sur la limite, à l'itération ${c.last}. Une droite
         sépare ici les élèves de ${c.house} de tous les autres : J n'a pas de minimum, et
         ‖∇J‖ décroît trop lentement pour passer sous 10⁻³ avant la limite. Sans elle, le
         critère l'aurait arrêtée à l'itération ${c.unbounded}.`],
    ['Suite', c.houseIndex + 1 < c.houseCount
      ? `À l'arrêt, la boucle des maisons passe au modèle de ${c.houses[c.houseIndex + 1]}.`
      : 'À l\'arrêt, les trois modèles sont entraînés : suit la décision.'],
  ]),
  more: () => `
    <p>Une itération enchaîne le calcul des scores, des probabilités, de la perte et du
    gradient, puis la mise à jour des poids. La norme comparée au seuil est celle du gradient
    qui servirait à la mise à jour.</p>
    <p>Un seuil sur la baisse de J entre deux itérations dépendrait de α : cette baisse vaut
    à peu près α‖∇J‖², et un petit α arrêterait la boucle loin du minimum. Avec α = 1,
    ‖∇J‖ &lt; 10⁻³ correspond à une baisse de 10⁻⁶. Quand α est trop grand, J oscille, et
    deux valeurs successives peuvent être proches loin du minimum ; la norme du gradient,
    elle, reste grande.</p>
    <p>Lorsque J a un minimum, ‖∇J‖ décroît géométriquement et passe vite sous 10⁻³.
    Lorsque les élèves de la maison sont séparables par une droite, J n'a pas de minimum :
    en agrandissant les poids, toutes les probabilités tendent vers 0 ou 1 du bon côté.
    ‖∇J‖ ne décroît plus qu'à peu près comme 1/t, et il faut des milliers d'itérations pour
    qu'il passe sous le seuil. Les poids obtenus classent correctement les élèves
    d'entraînement, avec des probabilités excessivement tranchées.</p>`,
};
