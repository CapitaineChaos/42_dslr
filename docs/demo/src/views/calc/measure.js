// Trois lectures d'un élève : pour le modèle de la maison en cours, étiquette
// y, score, probabilité, perte, contributions au gradient et case binaire ;
// pour la décision, les trois scores des modèles à l'arrêt et la maison du plus
// grand ; hors pli, la réponse des modèles entraînés sans lui.

import { DECIDE, FEATURES, HOUSE, OUT_OF_FOLD } from '../../dataset.js';
import { score, sigmoid, softplus } from '../../model.js';

export function measure(student, weights) {
  const x = FEATURES(student);
  const row = [1, ...x];
  const y = student.h === HOUSE ? 1 : 0;
  const z = score(weights, row);
  const p = sigmoid(z);
  const pred = z > 0 ? 1 : 0;
  const err = p - y;
  let kase = pred ? 'VP' : 'VN';
  if (pred !== y) kase = pred ? 'FP' : 'FN';
  const decision = DECIDE(student);
  const cv = OUT_OF_FOLD.get(student.id) || null;
  return {
    student, x, row, y, z, p, pred, err, kase,
    loss: softplus(z) - y * z,
    contribution: row.map((value) => err * value),
    miss: pred !== y,
    decision,
    wrong: decision.pred !== student.h,
    cv: cv && { ...cv, miss: cv.pred !== student.h },
  };
}
