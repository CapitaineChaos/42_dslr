// Préparation des notes et entraînement d'un modèle, pour un passage.
//
// Préparation : médiane des notes présentes pour combler les absences, puis
// moyenne et écart type de population sur les colonnes complétées, comme
// fit_scaler. Entraînement : une descente complète, et le cadrage des poids
// parcourus pour la figure de trajectoire.

import { descend } from './model.js';

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

export function prepare(training, courses, base) {
  const stats = {};
  courses.forEach((name, col) => {
    const present = training.filter((student) => !student.imputed[col]).map((student) => student.raw[col]);
    const med = median(present);
    const filled = training.map((student) => (student.imputed[col] ? med : student.raw[col]));
    const mu = filled.reduce((sum, value) => sum + value, 0) / filled.length;
    const sd = Math.sqrt(filled.reduce((sum, value) => sum + (value - mu) ** 2, 0) / filled.length);
    stats[name] = { ...base[name], median: med, mu, sd, present: present.length };
  });
  return stats;
}

function bounds(values, pad = 0.12, includeZero = false) {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (includeZero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
  const span = (hi - lo) || 1;
  return [lo - span * pad, hi + span * pad];
}

// Une descente arrêtée par la limite est relancée sans elle, pour dire à quelle
// itération le critère l'aurait arrêtée.
export function fit(rows, y, options) {
  const run = descend(rows, y, options);
  const last = run.trace.length - 1;
  const unbounded = run.converged
    ? last
    : descend(rows, y, { ...options, maxIter: 100 * options.maxIter }).trace.length - 1;
  return {
    y,
    trace: run.trace,
    last,
    converged: run.converged,
    unbounded,
    weights: run.weights,
    w1: bounds(run.trace.map((entry) => entry.weights[1]), 0.16, true),
    w2: bounds(run.trace.map((entry) => entry.weights[2]), 0.16, true),
  };
}
