// Conditionnement du relief tracé par la figure « Trajectoire ».
//
// La hessienne de J restreinte au plan (w₁, w₂) donne l'allongement des lignes
// de niveau : le rapport des demi-axes vaut la racine du rapport des valeurs
// propres. Le calcul passe par model.js, pas par une réimplémentation.
//
//   node scripts/conditionnement.mjs

import { DATA } from '../src/data.js';
import { descend, score, sigmoid } from '../src/model.js';

const TARGETS = DATA.train.map((student) => student.y);

function hessian(rows, weights) {
  const size = weights.length;
  const out = Array.from({ length: size }, () => new Array(size).fill(0));
  for (const row of rows) {
    const p = sigmoid(score(weights, row));
    const variance = p * (1 - p);
    for (let a = 0; a < size; a += 1) {
      for (let b = 0; b < size; b += 1) out[a][b] += variance * row[a] * row[b];
    }
  }
  return out.map((line) => line.map((value) => value / rows.length));
}

// Valeurs propres et direction molle du bloc (w₁, w₂).
function spectrum(H) {
  const a = H[1][1];
  const b = H[1][2];
  const d = H[2][2];
  const half = (a + d) / 2;
  const gap = Math.sqrt(Math.max(0, half * half - (a * d - b * b)));
  const high = half + gap;
  const low = half - gap;
  const norm = Math.hypot(b, low - a);
  return { high, low, soft: [b / norm, (low - a) / norm] };
}

function report(label, features) {
  const rows = DATA.train.map((student) => [1, ...features(student)]);
  const trace = descend(rows, TARGETS, { alpha: DATA.alpha, epsilon: 1e-6, maxIter: 6000 }).trace;
  console.log(`\n${label} — ${trace.length} itérations`);
  for (const t of [0, 20, 100, trace.length - 1]) {
    const { high, low, soft } = spectrum(hessian(rows, trace[t].weights));
    const head = `  t=${String(t).padStart(4)}`;
    // p(1−p) sous-passe dès que les scores atteignent quelques centaines : le
    // bloc est alors nul et le rapport n'a plus de valeur, pas même infinie.
    if (high === 0) {
      console.log(`${head}  hessienne saturée à zéro`);
      continue;
    }
    const axes = Math.sqrt(high / low);
    console.log(
      `${head}  κ=${(high / low).toPrecision(3).padStart(9)}`
      + `  axes ${axes.toPrecision(3).padStart(9)}:1`
      + `  molle (${soft[0].toFixed(2)}, ${soft[1].toFixed(2)})`,
    );
  }
}

const column = (k) => DATA.train.map((student) => student.x[k]);
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const x1 = column(0);
const x2 = column(1);
const m1 = mean(x1);
const m2 = mean(x2);
const correlation = mean(x1.map((value, i) => (value - m1) * (x2[i] - m2)))
  / (Math.sqrt(mean(x1.map((v) => (v - m1) ** 2))) * Math.sqrt(mean(x2.map((v) => (v - m2) ** 2))));

console.log(`corr(${DATA.courses.join(', ')}) = ${correlation.toFixed(4)}`);
report('standardisé', (student) => student.x);
report('brut', (student) => student.raw);
