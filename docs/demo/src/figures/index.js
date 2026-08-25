// Registre des figures. L'ordre est celui des cartes, et suit celui du cours :
// données, score, probabilité, perte, gradient, décision.

import { frontiere } from './frontiere.js';
import { scores } from './scores.js';
import { sigmoide } from './sigmoide.js';
import { surface } from './surface.js';
import { perte } from './perte.js';
import { chemin } from './chemin.js';
import { roc } from './roc.js';

export const FIGURES = [frontiere, scores, sigmoide, surface, perte, chemin, roc];

export const figureFor = (key) => FIGURES.find((figure) => figure.key === key) || FIGURES[0];
