// Options de l'écran de démarrage. Les modules du cours les lisent à leur
// import, donc app.js n'est chargé qu'après Démarrer, une fois les options
// fixées.

export const OPTIONS = [
  { key: 'cv', label: 'Validation croisée', value: false },
];

export const config = Object.fromEntries(OPTIONS.map(({ key, value }) => [key, value]));
