// Écriture des nombres et des maisons dans le tableau et le calcul déroulé :
// signe typographique, parenthèses autour d'un négatif, maison en couleur.

import { COURSES, HOUSES, STATS } from '../../dataset.js';

export const MINUS = '−';
export const num = (value, digits = 3) => `${value < 0 ? MINUS : ''}${Math.abs(value).toFixed(digits)}`;
export const signed = (value, digits = 3) => `${value < 0 ? MINUS : '+'}${Math.abs(value).toFixed(digits)}`;
export const paren = (value) => (value < 0 ? `(${num(value)})` : num(value));
export const tag = (h, text = HOUSES[h]) => `<span class="house h${h}">${text}</span>`;
export const initial = (h) => HOUSES[h][0];
export const label = (index) => STATS[COURSES[index]].label;
export const pct = (value) => (value === null ? '—' : `${(value * 100).toFixed(1)} %`);
export const zh = (h) => `z<sub>${initial(h)}</sub>`;
