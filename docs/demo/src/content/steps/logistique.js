import { S } from '../symbols.js';
import { at, spec } from './format.js';

export default {
  id: 'logistique',
  node: 'proba',
  phase: 'boucle',
  plot: 'sigmoide',
  title: 'Sigmoïde',
  math: 'p_i = \\sigma(z_i) = \\dfrac{1}{1 + e^{-z_i}}',
  calc: { group: 'train', cols: ['name', 'y', 'z', 'p'], worked: 'p' },
  intro: () => `Le score peut prendre n'importe quelle valeur réelle, alors qu'une probabilité est
    comprise entre 0 et 1. La sigmoïde convertit le score en probabilité et conserve l'ordre des
    scores.`,
  lead: (c) => spec([
    ['Allure', `${S.sigmoid} monte de 0 à 1 sans jamais les atteindre. Un score nul donne 0.5,
      un grand score positif une probabilité proche de 1, un grand score négatif une
      probabilité proche de 0.`],
    ['Seuil', `Comme σ est croissante, ${S.p} &gt; 0.5 équivaut à ${S.z} &gt; 0. Le seuil 0.5
      sur p donne donc la frontière z = 0.`],
    [at(c), `Les probabilités vont de ${c.pMin} à ${c.pMax}.`, true],
  ]),
  more: () => String.raw`
    <h4>Propriétés</h4>
    <p>\(\sigma\) est une [[bijection]] strictement croissante de \(\mathbb{R}\) sur
    \(]0, 1[\), avec \(\sigma(0) = 1/2\). Elle est symétrique autour de ce point :
    \(\sigma(-z) = 1 - \sigma(z)\). Un score de \(-2\) donne donc la probabilité
    complémentaire d'un score de \(+2\).</p>
    <h4>Cote</h4>
    <p>La sigmoïde s'inverse en</p>
    \[ \ln\frac{p}{1 - p} = z. \]
    <p>Le rapport \(p/(1 - p)\) est la [[cote]] de la maison. Le modèle suppose que le
    logarithme de la cote est une fonction [[fonction-affine|affine]] des notes. Une hausse d'un écart type dans la matière
    \(j\) ajoute \(w_j\) au score et multiplie la cote par \(e^{w_j}\).</p>
    <h4>Dérivée</h4>
    \[ \sigma'(z) = \sigma(z)\,\big(1 - \sigma(z)\big) \]
    <p>La dérivée est maximale en 0, où elle vaut 1/4. Cette identité réduit la dérivée de la
    perte à \(p - y\) (étape Erreur p − y).</p>
    <h4>Origine</h4>
    <p>Verhulst a introduit la fonction logistique en 1838 pour décrire la croissance d'une
    population. Berkson a nommé [[logit]] la fonction \(\ln(p/(1 - p))\) en 1944, et Cox a
    formalisé la régression logistique pour des réponses binaires en 1958.</p>`,
};
