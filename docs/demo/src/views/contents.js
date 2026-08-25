// Sommaire. Les huit thèmes dans l'ordre, les micro-étapes dépliées sous le
// thème courant, et la boucle d'entraînement matérialisée par un groupe encadré
// plutôt que par un glyphe à survoler.

import { STEPS } from '../content/steps.js';
import { on, state } from '../state.js';

const host = document.getElementById('contents');
const sectionButtons = new Map();
const stepButtons = new Map();
const stepLists = new Map();

const SECTIONS = [];
STEPS.forEach((step) => { if (!SECTIONS.includes(step.section)) SECTIONS.push(step.section); });

const phaseOf = (section) => STEPS.find((step) => step.section === section).phase;
const firstOf = (section) => STEPS.findIndex((step) => step.section === section);

function sectionItem(section, goto) {
  const item = document.createElement('li');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'section-link';
  button.textContent = section;
  button.addEventListener('click', () => goto(firstOf(section)));
  item.appendChild(button);
  sectionButtons.set(section, button);

  const list = document.createElement('ol');
  list.className = 'steps';
  STEPS.forEach((step, index) => {
    if (step.section !== section) return;
    const row = document.createElement('li');
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'step-link';
    link.textContent = step.title;
    link.addEventListener('click', () => goto(index));
    row.appendChild(link);
    list.appendChild(row);
    stepButtons.set(index, link);
  });
  item.appendChild(list);
  stepLists.set(section, list);

  return item;
}

function update() {
  const current = STEPS[state.step];
  sectionButtons.forEach((button, section) => {
    if (section === current.section) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  stepLists.forEach((list, section) => { list.hidden = section !== current.section; });
  stepButtons.forEach((button, index) => {
    if (index === state.step) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
}

export function mount(goto) {
  const root = document.createElement('ol');
  let group = null;

  SECTIONS.forEach((section) => {
    if (phaseOf(section) === 'boucle') {
      if (!group) {
        const wrapper = document.createElement('li');
        wrapper.className = 'group';
        const label = document.createElement('span');
        label.className = 'group-label';
        label.textContent = 'boucle';
        wrapper.appendChild(label);
        group = document.createElement('ol');
        wrapper.appendChild(group);
        root.appendChild(wrapper);
      }
      group.appendChild(sectionItem(section, goto));
      return;
    }
    root.appendChild(sectionItem(section, goto));
  });

  host.appendChild(root);
  on('step', update);
  update();
}
