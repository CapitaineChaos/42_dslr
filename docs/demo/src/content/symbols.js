// Définition de chaque symbole du cours, affichée au survol ou au focus.
//
// Deux sigma se croisent : l'écart type de la standardisation et la fonction
// sigmoïde. Chacun a sa propre entrée.

import { config } from '../config.js';
import { COURSES, HOUSES, STATS } from '../dataset.js';

const label = (index) => STATS[COURSES[index]].label;

export const NOTES = {
  x1: `Note de ${label(0)} standardisée : (note − μ) / σ.`,
  x2: `Note de ${label(1)} standardisée : (note − μ) / σ.`,
  y: 'Étiquette : 1 si l\'élève est de la maison du modèle en cours, 0 sinon.',
  house: 'Maison réelle de l\'élève.',
  w: 'Poids du modèle (w₀, w₁, w₂), ajustés par la descente de gradient.',
  w0: 'Terme constant du score.',
  w1: `Poids de la note de ${label(0)} standardisée dans le score.`,
  w2: `Poids de la note de ${label(1)} standardisée dans le score.`,
  z: 'Score de l\'élève : w₀ + w₁·x₁ + w₂·x₂.',
  zh: HOUSES.map((name) => `Score du modèle de ${name}, à son arrêt.`),
  hmax: 'Maison dont le modèle donne le plus grand score.',
  precision: 'Part des élèves de la maison parmi ceux qui y sont classés.',
  recall: 'Part des élèves de la maison qui y sont classés.',
  f1: 'Moyenne harmonique de la précision et du rappel : 2PR / (P + R).',
  p: 'Probabilité que l\'élève soit de la maison du modèle en cours : σ(z).',
  sigmoid: 'Fonction sigmoïde : σ(z) = 1 / (1 + e^(−z)), à valeurs dans ]0, 1[.',
  loss: 'Perte de l\'élève (entropie croisée) : −ln p si y = 1, −ln(1 − p) si y = 0.',
  J: 'Perte du modèle en cours : moyenne des pertes des élèves d\'entraînement du passage.',
  err: 'Erreur de l\'élève : dérivée de sa perte par rapport à son score.',
  grad: 'Gradient de J : dérivées partielles de J par rapport à w₀, w₁ et w₂.',
  alpha: 'Pas d\'apprentissage : facteur du gradient retranché aux poids à chaque itération.',
  epsilon: 'Seuil du critère d\'arrêt, appliqué à la norme du gradient.',
  limit: 'Nombre maximal d\'itérations d\'une descente.',
  n: 'Nombre d\'élèves d\'entraînement du passage.',
  mu: 'Moyenne de la matière, calculée sur les élèves d\'entraînement du passage.',
  sd: 'Écart type de la matière, calculé sur les élèves d\'entraînement du passage.',
  c0: 'Contribution de l\'élève à ∂J/∂w₀ : (p − y) × 1.',
  c1: 'Contribution de l\'élève à ∂J/∂w₁ : (p − y) × x₁.',
  c2: 'Contribution de l\'élève à ∂J/∂w₂ : (p − y) × x₂.',
  case: 'Pour le modèle en cours : VP, élève de sa maison reconnu ; FN, élève de sa maison manqué ; FP, élève d\'une autre maison retenu ; VN, élève d\'une autre maison écarté.',
  group: `Apprentissage : maison connue${config.cv ? ', élève réparti dans un pli' : ''}. Réservé : maison prédite par le modèle final.`,
  fold: 'Pli de validation croisée auquel appartient l\'élève.',
  cvpred: 'Maison attribuée par les modèles entraînés sans le pli de l\'élève.',
  raw: 'Note brute. Une note absente du fichier est affichée « — ».',
};

export const tip = (text, note, below = false) =>
  `<abbr class="sym${below ? ' below' : ''}" tabindex="0" data-tip="${note}">${text}</abbr>`;

export const S = {
  x1: tip('x₁', NOTES.x1),
  x2: tip('x₂', NOTES.x2),
  y: tip('y', NOTES.y),
  w: tip('w', NOTES.w),
  w0: tip('w₀', NOTES.w0),
  w1: tip('w₁', NOTES.w1),
  w2: tip('w₂', NOTES.w2),
  z: tip('z', NOTES.z),
  p: tip('p', NOTES.p),
  sigmoid: tip('σ', NOTES.sigmoid),
  loss: tip('ℓ', NOTES.loss),
  J: tip('J', NOTES.J),
  err: tip('p − y', NOTES.err),
  grad: tip('∇J', NOTES.grad),
  alpha: tip('α', NOTES.alpha),
  mu: tip('μ', NOTES.mu),
  sd: tip('σ', NOTES.sd),
};
