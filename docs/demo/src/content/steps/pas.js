// Mise à jour des poids

import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'pas',
  node: 'maj',
  phase: 'boucle',
  plot: 'chemin',
  title: 'Mise à jour des poids',
  math: 'w^{(t+1)} = w^{(t)} - \\alpha\\,\\nabla J(w^{(t)})',
  calc: { group: 'train', cols: ['name', 'y', 'c0', 'c1', 'c2'], footer: 'update', worked: 'update' },
  lead: (c) => spec([
    ['Calcul', `Chaque poids est corrigé selon ${S.w} ← w − ${S.alpha}·${S.grad}, avec
      α = ${c.alpha}.`],
    ['Pourquoi', `Le gradient indique la direction dans laquelle J croît le plus vite ; un
      déplacement dans la direction opposée fait donc décroître J.`],
    [at(c), c.t === c.last
      ? (c.converged ? 'Le critère d\'arrêt est atteint : les poids ne sont plus modifiés.'
        : 'La limite d\'itérations est atteinte : les poids ne sont plus modifiés.')
      : `w₀ passe de ${c.wf[0]} à ${c.wnf[0]}, w₁ de ${c.wf[1]} à ${c.wnf[1]}, w₂ de
         ${c.wf[2]} à ${c.wnf[2]}.`, true],
    ['Suite', 'Le calcul reprend à l\'étape Score avec les nouveaux poids : c\'est l\'itération suivante.'],
  ]),
  more: (c) => `
    <p>La figure Trajectoire montre la suite des poids sur le relief de J.</p>
    <p>Pour une fonction convexe dont le gradient est L-lipschitzien, la descente converge
    dès que α &lt; 2/L ; pour la perte logistique, L ≤ λ<sub>max</sub>(XᵀX / n) / 4. La
    condition est suffisante, pas nécessaire : près du minimum, σ′(z) est presque nul pour
    les élèves bien classés, et la courbure y est bien inférieure à L. Sur dataset_train,
    2/L = 1.81 et α = 30 converge encore.</p>
    <p>J étant convexe, tout α qui converge mène au même minimum : α règle la vitesse, pas
    le modèle. Trop grand, il fait osciller J sans le rendre infini, car le gradient reste
    borné ; la boucle s'arrête alors sur la limite. Ici, α = ${c.alpha}.</p>`,
};
