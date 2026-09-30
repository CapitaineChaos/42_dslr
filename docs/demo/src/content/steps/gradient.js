import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'gradient',
  node: 'gradient',
  phase: 'boucle',
  plot: 'chemin',
  title: 'Gradient ∇J',
  math: '\\dfrac{\\partial J}{\\partial w_j} = \\dfrac{1}{n}\\sum_{i=1}^{n} (p_i - y_i)\\, x_{ij}',
  calc: { group: 'train', cols: ['name', 'err', 'x1', 'x2', 'c0', 'c1', 'c2'], footer: 'grad', worked: 'gradient' },
  intro: () => `Le [[gradient]] dit, pour chaque poids, si le coût J monte ou descend quand ce
    poids augmente un peu, et à quelle vitesse. Un poids n'agit sur le score qu'à travers la
    note de sa matière. Sa [[derivee-partielle|dérivée]] est donc la moyenne des erreurs p − y
    des élèves, chacune multipliée par la note de l'élève dans cette matière.`,
  lead: (c) => spec([
    ['Signe', `Une dérivée positive indique qu'augmenter le poids ferait monter J. La mise à
      jour va donc le diminuer. Une dérivée négative indique l'inverse.`],
    ['Contributions', `Chaque élève tire chaque poids dans un sens. Un élève mal classé dont la
      note est loin de la moyenne tire fort. Un élève bien classé, dont l'erreur est proche de
      0, ne tire presque pas.`],
    ['Terme constant', `${S.w0} ne multiplie aucune note. Sa dérivée est la moyenne des erreurs seules,
      comme si la note valait 1.`],
    [at(c), `${S.grad} = (${c.gf.join(' ; ')}), la moyenne des contributions des ${c.n}
      élèves.`, true],
  ]),
  more: () => String.raw`
    <h4>Dérivation</h4>
    <p>La perte \(\ell_i\) dépend du poids \(w_j\) à travers le score \(z_i\). Par
    [[derivation-chaine|dérivation en chaîne]],</p>
    \[ \frac{\partial \ell_i}{\partial w_j} = \frac{\partial \ell_i}{\partial z_i}\,
       \frac{\partial z_i}{\partial w_j} = (p_i - y_i)\, x_{ij}. \]
    <p>Le premier facteur vient de l'étape Erreur p − y. Le second vient de
    \(z_i = w_0 + \sum_j w_j x_{ij}\), où seul le terme \(w_j x_{ij}\) dépend de \(w_j\). Pour
    \(w_0\), la même formule s'applique en posant \(x_{i0} = 1\). Comme \(J\) est la moyenne
    des \(\ell_i\), sa dérivée est la moyenne de ces dérivées.</p>
    <h4>Forme matricielle</h4>
    \[ \nabla J(w) = \frac{1}{n}\, X^{\mathsf T}(p - y) \]
    <p>La ligne \(i\) de la [[matrice]] \(X\) est \((1, x_{i1}, \dots, x_{id})\),
    \(X^{\mathsf T}\) est sa [[transposee|transposée]], \(p\) est le vecteur des probabilités et
    \(y\) celui des étiquettes. Ce produit calcule les \(d + 1\) dérivées partielles en une
    opération.</p>
    <h4>Direction</h4>
    <p>\(\nabla J\) indique la direction dans laquelle \(J\) augmente le plus vite, et
    \(-\nabla J\) celle de la plus forte baisse, que suit la mise à jour.
    \(\lVert \nabla J \rVert\) tend vers 0 à l'approche du minimum, et les corrections
    \(\alpha \nabla J\) diminuent d'autant.</p>`,
};
