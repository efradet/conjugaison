// Sauvegarde locale (dans ce navigateur) : séries en cours, réglages, points faibles.
import {defaultFilter} from '../engine/series.js';

const KEY = 'conjugaison-v1';

const empty = () => ({runs: {}, filter: defaultFilter(), piles: {}, errors: {}});

export function loadStore() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && typeof data === 'object' && data.runs) return {...empty(), ...data};
  } catch { /* stockage indisponible ou abîmé */ }
  return empty();
}

export function saveStore(store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)); return true; } catch { return false; }
}
