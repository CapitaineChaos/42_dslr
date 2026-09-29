// Portage JavaScript de la descente de dslr/model.py.
// Les deux implémentations doivent rendre les mêmes nombres : mêmes parades
// numériques, même ordre des opérations, même critère d'arrêt.

// Les deux branches gardent l'exposant négatif ou nul : un score de -1000
// donne 0 au lieu de faire déborder l'exponentielle.
export function sigmoid(x) {
  if (x >= 0) return 1 / (1 + Math.exp(-x));
  const ex = Math.exp(x);
  return ex / (1 + ex);
}

export function softplus(x) {
  return Math.max(0, x) + Math.log(1 + Math.exp(-Math.abs(x)));
}

export function score(weights, row) {
  let total = 0;
  for (let col = 0; col < weights.length; col += 1) total += weights[col] * row[col];
  return total;
}

// J(w) = (1/n) Σ softplus(z) - y*z, forme stable de la perte logistique.
export function cost(rows, targets, weights) {
  let total = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const z = score(weights, rows[i]);
    total += softplus(z) - targets[i] * z;
  }
  return total / rows.length;
}

// ∇J = (1/n) Xᵀ(p - y)
export function gradient(rows, targets, weights) {
  const slope = new Array(weights.length).fill(0);
  for (let i = 0; i < rows.length; i += 1) {
    const delta = sigmoid(score(weights, rows[i])) - targets[i];
    for (let col = 0; col < weights.length; col += 1) slope[col] += delta * rows[i][col];
  }
  for (let col = 0; col < weights.length; col += 1) slope[col] /= rows.length;
  return slope;
}

export function stepOnce(rows, targets, weights, alpha) {
  const slope = gradient(rows, targets, weights);
  return weights.map((value, col) => value - alpha * slope[col]);
}

export function norm(vector) {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

// Nombre de fois où le signe du score contredit l'étiquette.
export function errors(rows, targets, weights) {
  let wrong = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const predicted = score(weights, rows[i]) > 0 ? 1 : 0;
    if (predicted !== targets[i]) wrong += 1;
  }
  return wrong;
}

// Quatre cases, puis les taux qui s'en déduisent. Un taux dont le dénominateur
// est nul vaut null et non zéro : au premier tour rien n'est prédit positif, et
// une précision nulle dirait le contraire d'une précision indéfinie.
export function confusion(rows, targets, weights) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const predicted = score(weights, rows[i]) > 0 ? 1 : 0;
    if (predicted === 1 && targets[i] === 1) tp += 1;
    else if (predicted === 1 && targets[i] === 0) fp += 1;
    else if (predicted === 0 && targets[i] === 1) fn += 1;
    else tn += 1;
  }
  const ratio = (num, den) => (den === 0 ? null : num / den);
  const precision = ratio(tp, tp + fp);
  const recall = ratio(tp, tp + fn);
  return {
    tp, fp, fn, tn,
    accuracy: (tp + tn) / rows.length,
    precision,
    recall,
    specificity: ratio(tn, tn + fp),
    f1: precision === null || recall === null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall),
  };
}

// Indice du plus grand score ; à égalité, le premier, comme argmax de numpy.
export function argmax(values) {
  return values.reduce((best, value, i) => (value > values[best] ? i : best), 0);
}

// Matrice de confusion à partir de couples (maison réelle, maison attribuée) :
// une ligne par maison réelle, une colonne par maison attribuée.
export function matrixOf(pairs, size) {
  const matrix = Array.from({ length: size }, () => new Array(size).fill(0));
  pairs.forEach(([real, predicted]) => { matrix[real][predicted] += 1; });
  return matrix;
}

// Scores de chaque maison, comme le rapport du projet : précision sur sa
// colonne, rappel sur sa ligne, F1 leur moyenne harmonique. Un taux dont le
// dénominateur est nul vaut null.
export function report(matrix) {
  const ratio = (num, den) => (den === 0 ? null : num / den);
  const total = matrix.flat().reduce((sum, value) => sum + value, 0);
  const good = matrix.reduce((sum, row, h) => sum + row[h], 0);
  const houses = matrix.map((row, h) => {
    const predicted = matrix.reduce((sum, line) => sum + line[h], 0);
    const real = row.reduce((sum, value) => sum + value, 0);
    const precision = ratio(row[h], predicted);
    const recall = ratio(row[h], real);
    const f1 = precision === null || recall === null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall);
    return { precision, recall, f1, total: real };
  });
  return { houses, good, total, accuracy: good / total };
}

// Descente complète, avec le critère d'arrêt de logreg_train.py : norme du
// gradient sous EPSILON, mesurée avant la mise à jour des poids. L'entrée t de
// la trace porte les poids après t mises à jour ; à la limite, maxIter.
export function descend(rows, targets, { alpha = 1.0, epsilon = 1e-3, maxIter = 6000 } = {}) {
  let weights = new Array(rows[0].length).fill(0);
  const trace = [];
  for (let iteration = 0; ; iteration += 1) {
    const slope = gradient(rows, targets, weights);
    const size = norm(slope);
    trace.push({ iteration, cost: cost(rows, targets, weights), weights: weights.slice(), norm: size });
    if (size < epsilon) return { weights, trace, converged: true };
    if (iteration === maxIter) return { weights, trace, converged: false };
    weights = weights.map((value, col) => value - alpha * slope[col]);
  }
}


