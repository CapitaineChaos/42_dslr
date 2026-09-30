import { S } from '../symbols.js';
import { spec } from './format.js';

export default {
  id: 'perte-observation',
  node: 'perte',
  phase: 'boucle',
  plot: 'perte',
  title: "Perte ℓ d'un élève",
  math: '\\ell_i = -\\big[\\, y_i \\ln p_i + (1 - y_i) \\ln(1 - p_i) \\,\\big]',
  calc: { group: 'train', cols: ['name', 'y', 'p', 'loss'], worked: 'loss' },
  intro: () => `Pour ajuster les poids, il faut mesurer l'écart entre la probabilité prédite et
    l'étiquette. La perte d'un élève est faible quand le modèle donne une forte probabilité à sa
    vraie étiquette, et grande sinon.`,
  lead: () => spec([
    ['Cas', `Un seul des deux termes est non nul. Si ${S.y} = 1, ${S.loss} = −ln ${S.p}. Si
      y = 0, ℓ = −ln(1 − p).`],
    ['Valeurs', `ℓ vaut 0 quand la probabilité de la vraie étiquette vaut 1, 0.693 quand elle
      vaut 0.5 et 4.61 quand elle vaut 0.01. ℓ tend vers l'infini quand cette probabilité tend
      vers 0.`],
    ['Forme', 'Vue comme une fonction du score z, ℓ a la forme d\'une [[convexite|cuvette]], sans creux secondaire.'],
    ['Code', 'Le code calcule ℓ = [[softplus]](z) − y·z, une forme équivalente qui n\'évalue jamais ln 0.'],
  ]),
  more: () => String.raw`
    <h4>Vraisemblance</h4>
    <p>Pour l'élève \(i\), le modèle donne la probabilité \(p_i\) d'être de la maison, et
    \(1 - p_i\) d'être d'une autre maison. La probabilité qu'il donne à l'étiquette observée
    \(y_i\) s'écrit en une seule formule :</p>
    \[ P(y_i \mid x_i) = p_i^{\,y_i}\,(1 - p_i)^{\,1 - y_i}. \]
    <p>La notation \(P(y_i \mid x_i)\) se lit « probabilité de \(y_i\) sachant les notes
    \(x_i\) ». Si \(y_i = 1\), l'exposant \(1 - y_i\) est nul et le produit vaut \(p_i\). Si
    \(y_i = 0\), il vaut \(1 - p_i\). Pour un élève de la maison à qui le modèle donne
    \(p_i = 0.8\), ce terme vaut 0.8. Pour un élève d'une autre maison avec la même
    probabilité, il vaut 0.2.</p>
    <p>Les élèves étant supposés [[independance|indépendants]], la probabilité de toutes les
    étiquettes est le produit de ces termes, appelé [[vraisemblance]]. Les meilleurs poids
    sont ceux qui la maximisent. Le [[logarithme]] change le produit en somme, et maximiser une
    quantité revient à minimiser son opposé :</p>
    \[ -\ln \prod_{i=1}^{n} P(y_i \mid x_i) = \sum_{i=1}^{n} \ell_i. \]
    <p>La perte d'un élève est donc l'opposé du logarithme de la probabilité que le modèle donne
    à son étiquette. Elle porte aussi le nom d'[[entropie-croisee|entropie croisée]].</p>
    <h4>Forme stable</h4>
    <p>Avec \(p = \sigma(z)\),</p>
    \[ \ln p = -\ln(1 + e^{-z}), \qquad \ln(1 - p) = -\ln(1 + e^{z}). \]
    <p>En remplaçant dans \(\ell\), puis en utilisant \(\ln(1 + e^{-z}) = \ln(1 + e^{z}) - z\),</p>
    \[ \ell = y \ln(1 + e^{-z}) + (1 - y) \ln(1 + e^{z}) = \ln(1 + e^{z}) - y\,z. \]
    <p>La fonction \(\mathrm{softplus}(z) = \ln(1 + e^{z})\) se calcule sans débordement
    (étape Stabilité numérique).</p>
    <h4>Écart quadratique</h4>
    <p>Avec la perte \((p - y)^2\), \(J\) ne serait plus [[convexite|convexe]] en \(w\). Sa dérivée par
    rapport à \(z\) vaut \(2(p - y)\,p\,(1 - p)\) et s'annule quand \(p\) tend vers 0 ou 1, y
    compris pour un élève très mal classé, qui ne corrigerait alors presque plus les
    poids.</p>`,
};
