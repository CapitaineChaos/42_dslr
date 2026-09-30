import { ALGEBRE } from './algebre.js';
import { ANALYSE } from './analyse.js';
import { APPRENTISSAGE } from './apprentissage.js';
import { EVALUATION } from './evaluation.js';
import { MODELE } from './modele.js';
import { STATISTIQUE } from './statistique.js';

export const WIKI = { ...ALGEBRE, ...ANALYSE, ...STATISTIQUE, ...MODELE, ...APPRENTISSAGE, ...EVALUATION };

// [[norme|la norme]] -> <button … data-term="norme">la norme</button>
export const LINK = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

export const linkTerms = (html) => html.replace(LINK, (_, key, text) => {
  const entry = WIKI[key];
  const label = text || entry.title.toLowerCase();
  return `<button type="button" class="sym term" data-term="${key}" data-tip="${entry.short}">${label}</button>`;
});
