import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'pas',
  node: 'maj',
  phase: 'boucle',
  plot: 'chemin',
  title: 'Mise à jour des poids',
  math: 'w_j \\leftarrow w_j - \\alpha\\, \\dfrac{\\partial J}{\\partial w_j}, \\qquad j = 0, \\dots, d',
  calc: { group: 'train', cols: ['name', 'y', 'c0', 'c1', 'c2'], footer: 'update', worked: 'update' },
  intro: () => `Le gradient indique la direction de plus forte hausse de J. La mise à jour
    déplace les poids d'un pas dans la direction opposée, puis la boucle recommence avec les
    nouveaux poids.`,
  lead: (c) => spec([
    ['Pas', `${S.alpha} fixe la [[pas-apprentissage|longueur du pas]]. Ici α = ${c.alpha}.`],
    [at(c), c.t === c.last
      ? (c.converged ? 'Le critère d\'arrêt est atteint. Les poids ne sont plus modifiés.'
        : 'La limite d\'itérations est atteinte. Les poids ne sont plus modifiés.')
      : `w₀ passe de ${c.wf[0]} à ${c.wnf[0]}, w₁ de ${c.wf[1]} à ${c.wnf[1]}, w₂ de
         ${c.wf[2]} à ${c.wnf[2]}.`, true],
  ]),
  more: () => String.raw`
    <h4>Pas d'apprentissage</h4>
    <p>Pour une fonction convexe dont le gradient est
    [[lipschitz|\(L\)-lipschitzien]], la descente converge dès que \(\alpha < 2/L\). Pour la
    régression logistique,</p>
    \[ L \le \frac{1}{4}\, \lambda_{\max}\Big(\frac{X^{\mathsf T} X}{n}\Big), \]
    <p>où \(\lambda_{\max}\) est la plus grande [[valeurs-propres|valeur propre]] de la
    matrice \(X^{\mathsf T} X / n\).</p>
    <p>La condition est suffisante mais pas nécessaire. Près du minimum, \(\sigma'(z)\) est
    presque nul pour les élèves bien classés, et la courbure y est très inférieure à \(L\).
    Sur dataset_train, \(2/L = 1.81\) et la descente converge encore avec \(\alpha = 30\).</p>
    <p>\(J\) est convexe, donc toute valeur de \(\alpha\) qui converge mène au même
    minimum. \(\alpha\) ne modifie que le nombre d'itérations. Si \(\alpha\) est trop grand,
    \(J\) oscille sans devenir infini, car le gradient reste borné. La boucle s'arrête alors à
    la limite d'itérations.</p>
    <h4>Origine</h4>
    <p>Cauchy a proposé la [[descente-gradient|descente de gradient]] en 1847, pour résoudre des systèmes
    d'équations.</p>`,
};
