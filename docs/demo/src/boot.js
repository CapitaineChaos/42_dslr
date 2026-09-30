// Démarrage : écran de chargement, bibliothèques, calcul des six passages, puis
// Démarrer, qui fixe les options et monte les vues. La page n'apparaît qu'une
// fois tout prêt : figures dessinées et première formule écrite.

import { config } from './config.js';
import { FINAL, HOUSES, K, compute, passesFor, usePli } from './dataset.js';
import { state } from './state.js';
import * as loader from './views/loader.js';
import * as start from './views/start.js';

const passage = (pli) => (pli === FINAL ? 'modèle final' : `pli ${pli + 1} sur ${K}`);

const LABELS = {
  prep: ({ pli }) => `préparation des notes · ${passage(pli)}`,
  descent: ({ pli, house }) => `descente de gradient · ${passage(pli)} · ${HOUSES[house]}`,
  validation: () => 'validation croisée',
};

// Bibliothèques, puis pour chaque passage la préparation et une descente par
// maison, puis le bilan. Les six passages sont calculés quelle que soit
// l'option, car elle peut changer jusqu'à Démarrer.
start.mount();
loader.start(1 + (K + 1) * (1 + HOUSES.length) + 1);

if (window.MathJax && window.MathJax.startup) await window.MathJax.startup.promise;
await Promise.all([
  "400 1em 'IBM Plex Sans'", "600 1em 'IBM Plex Sans'",
  "600 1em 'Space Grotesk'", "700 1em 'Space Grotesk'",
  "400 1em 'JetBrains Mono'", "600 1em 'JetBrains Mono'",
].map((face) => document.fonts.load(face)));
await document.fonts.ready;
await loader.step('bibliothèques');

await compute((event) => loader.step(LABELS[event.kind](event)));
loader.ready();
start.ready();

await start.chosen();
state.pli = passesFor(config.cv)[0].pli;
usePli(state.pli, 0);

const app = await import('./app.js');
await app.ready();
await loader.finish();
