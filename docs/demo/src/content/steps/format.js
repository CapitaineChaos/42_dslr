// Mise en forme commune aux fiches : liste terme-définition, repère
// d'itération, indices, accord du pluriel.

// La ligne marquée `now` porte la valeur à l'itération courante.
export const spec = (rows) => `<dl class="spec">${rows.map(([term, value, now]) =>
  `<dt class="${now ? 'is-now' : ''}">${term}</dt><dd>${value}</dd>`).join('')}</dl>`;

export const at = (c) => `itération ${c.t}`;
export const sub = (n) => String(n).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
export const plural = (n, one, many) => (n > 1 ? many : one);
