import { at, spec } from './format.js';

export default {
  id: 'arret',
  node: 'maj',
  phase: 'boucle',
  plot: 'perte',
  title: "Critère d'arrêt",
  math: '\\lVert \\nabla J(w) \\rVert < \\varepsilon',
  calc: { group: null, cols: null, worked: 'stop' },
  intro: () => `La descente doit s'arrêter quand les poids sont assez proches du minimum. La
    [[norme]] du gradient, nulle au minimum, sert de mesure.`,
  lead: (c) => spec([
    ['Critère', `La boucle s'arrête quand ‖∇J‖ &lt; 10⁻³. Le test est fait avant la mise à
      jour des poids.`],
    ['Limite', `La boucle s'arrête aussi après ${c.maxIter} itérations, ce qui borne une
      descente qui ne converge pas.`],
    [at(c), c.t < c.last
      ? `‖∇J‖ vaut ${c.gradNorm}, au-dessus du seuil. La boucle continue.`
      : c.converged
        ? `‖∇J‖ vaut ${c.gradNorm}, sous le seuil. La boucle s'arrête.`
        : `‖∇J‖ vaut encore ${c.gradNorm}, mais la limite de ${c.maxIter} itérations est
           atteinte. La boucle s'arrête.`, true],
    !c.converged && ['Arrêt sur la limite', `Une droite [[separabilite|sépare]] les élèves de ${c.house} de tous
      les autres. Dans ce cas J n'a pas de minimum, et ‖∇J‖ décroît trop lentement pour
      passer sous 10⁻³ avant la limite. Sans la limite, le critère aurait arrêté la descente
      à l'itération ${c.unbounded}.`],
  ].filter(Boolean)),
  more: () => String.raw`
    <p>Un seuil sur la baisse de \(J\) entre deux itérations dépendrait de \(\alpha\).
    Cette baisse vaut à peu près \(\alpha \lVert \nabla J \rVert^2\), donc un petit
    \(\alpha\) arrêterait la boucle loin du minimum. Avec \(\alpha = 1\),
    \(\lVert \nabla J \rVert < 10^{-3}\) correspond à une baisse de \(10^{-6}\). Quand
    \(\alpha\) est trop grand, \(J\) oscille et deux valeurs successives peuvent être proches
    loin du minimum, alors que la norme du gradient reste grande. La norme du gradient mesure
    l'écart au minimum quelle que soit la valeur de \(\alpha\).</p>
    <p>Quand \(J\) a un minimum, \(\lVert \nabla J \rVert\) décroît géométriquement et passe
    vite sous \(10^{-3}\). Quand une droite sépare les élèves de la maison des autres, \(J\)
    n'a pas de minimum. Les poids grandissent et toutes les probabilités tendent vers 0 ou 1 du
    bon côté. \(\lVert \nabla J \rVert\) décroît alors à peu près comme \(1/t\), et il faut
    des milliers d'itérations pour passer sous le seuil.</p>`,
};
