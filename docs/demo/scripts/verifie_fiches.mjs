//   node docs/demo/scripts/verifie_fiches.mjs

import { readdirSync } from 'node:fs';

import { config } from '../src/config.js';
import { HOUSES, compute, passesFor, usePli } from '../src/dataset.js';

const FAULTS = [
  ['valeur absente', /undefined|NaN|\[object|\bnull\b|\bfalse\b/],
  ['nombre non arrondi', /\d\.\d{7,}/],
  ['pluriel après 1', /(^|[^\d.,])1 (élèves|erreurs|notes)/],
];

const STEP_FILES = readdirSync(new URL('../src/content/steps/', import.meta.url))
  .filter((name) => name !== 'nodes.js' && name !== 'format.js');

await compute(async () => {});
const { buildContext } = await import('../src/context.js');
const dataset = await import('../src/dataset.js');
const { FIGURES } = await import('../src/figures/index.js');
const { STEPS } = await import('../src/content/steps.js');
const { state } = await import('../src/state.js');

const steps = [];
for (const name of STEP_FILES) {
  steps.push((await import(`../src/content/steps/${name}`)).default);
}

const found = new Map();

function check(id, text, where) {
  for (const [label, pattern] of FAULTS) {
    const match = text.match(pattern);
    const key = `${id} : ${label}`;
    if (match && !found.has(key)) found.set(key, `${key} « ${match[0]} » (${where})`);
  }
}

function checkFigures(t, where) {
  for (const phase of ['boucle', 'post']) {
    state.step = STEPS.findIndex((step) => step.phase === phase);
    for (const figure of FIGURES) check(`figure ${figure.key}`, figure.describe(t), where);
  }
}

for (const crossValidation of [true, false]) {
  config.cv = crossValidation;
  for (const pass of passesFor(crossValidation)) {
    for (let house = 0; house < HOUSES.length; house += 1) {
      usePli(pass.pli, house);
      const last = dataset.LAST;
      for (const t of new Set([0, 1, Math.round(last / 2), last])) {
        const context = buildContext(t);
        const where = `passage ${pass.pli + 1}, ${HOUSES[house]}, itération ${t}`;
        for (const step of steps) {
          if (step.phase === 'valid' && (!crossValidation || pass.held.length === 0)) continue;
          check(step.id, `${step.lead(context)} ${step.more(context)}`, where);
        }
      }
      for (let t = 0; t <= last; t += 1) {
        checkFigures(t, `passage ${pass.pli + 1}, ${HOUSES[house]}, itération ${t}`);
      }
    }
  }
}

for (const line of found.values()) console.error(line);
console.log(`${steps.length} fiches, ${FIGURES.length} figures, ${found.size} défaut${found.size > 1 ? 's' : ''}`);
process.exit(found.size ? 1 : 0);
