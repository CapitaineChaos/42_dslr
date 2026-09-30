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
    [at(c), c.t === c.last
      ? (c.converged ? 'Le critère d\'arrêt est atteint. Les poids ne sont plus modifiés.'
        : 'La limite d\'itérations est atteinte. Les poids ne sont plus modifiés.')
      : `w₀ passe de ${c.wf[0]} à ${c.wnf[0]}, w₁ de ${c.wf[1]} à ${c.wnf[1]}, w₂ de
         ${c.wf[2]} à ${c.wnf[2]}.`, true],
  ]),
  moreTitle: 'Pas d\'apprentissage',
  more: () => `
    <p>Pour une fonction convexe dont le gradient est L-lipschitzien, la descente converge
    dès que α &lt; 2/L. Pour la perte logistique, L ≤ λ<sub>max</sub>(XᵀX / n) / 4. Cette
    condition est suffisante mais pas nécessaire. Près du minimum, σ′(z) est presque nul
    pour les élèves bien classés, et la courbure y est très inférieure à L. Sur
    dataset_train, 2/L = 1.81 et la descente converge encore avec α = 30.</p>
    <p>J est convexe, donc toute valeur de α qui converge mène au même minimum. α ne
    modifie que le nombre d'itérations. Si α est trop grand, J oscille sans devenir infini,
    car le gradient reste borné. La boucle s'arrête alors à la limite d'itérations.</p>`,
};
