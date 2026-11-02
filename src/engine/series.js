import {VERB_LIST, TENSES, isValid, hasPerson, isImperative, PRONOUNS} from './verbs.js';
import {GAPS} from '../content/gaps.js';
import {VOICE} from '../content/voice.js';
import {COMPOSE} from '../content/compose.js';

export const SERIES = {
  conj: {n: 20},
  gap: {n: 10},
  voice: {n: 10},
  compose: {n: 10},
  test: {n: 20},
};

export const defaultFilter = () => ({
  verbs: VERB_LIST.map(v => v.id),
  tenses: TENSES.filter(t => !t.optional).map(t => t.id),
});

export function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Un paquet de cartes : on le tire entièrement avant de le remélanger.
function deck(list, rng) {
  let pile = [];
  return () => { if (!pile.length) pile = shuffle(list, rng); return pile.pop(); };
}

const THIRD_S = ['il', 'elle', 'on'], THIRD_P = ['ils', 'elles'];
const pick = (list, rng) => list[Math.floor(rng() * list.length)];

// 20 questions : chaque temps et chaque verbe reviennent à tour de rôle, sans doublon.
export function buildConj(n, filter, rng = Math.random) {
  const verbs = filter.verbs, tenses = filter.tenses;
  const nextT = deck(tenses, rng), nextV = deck(verbs, rng);
  const nextP = deck(['je', 'tu', '3s', 'nous', 'vous', '3p'], rng), nextI = deck(['tu', 'nous', 'vous'], rng);
  const seen = new Set(), out = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 200) {
    const t = nextT(), v = nextV();
    if (!isValid(v, t)) continue;
    let pr = 'il';
    if (isImperative(t)) pr = nextI();
    else if (hasPerson(t)) {
      const p = nextP();
      pr = p === '3s' ? pick(THIRD_S, rng) : p === '3p' ? pick(THIRD_P, rng) : p;
    }
    const key = `${v}|${t}|${PRONOUNS[pr]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({k: 'conj', v, t, pr});
  }
  return out;
}

export function buildReview(errors, n, rng = Math.random) {
  const pairs = shuffle(Object.keys(errors).filter(k => errors[k] > 0), rng);
  const out = [], seen = new Set();
  const nextP = deck(['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'], rng), nextI = deck(['tu', 'nous', 'vous'], rng);
  for (let round = 0; round < 4 && out.length < n; round++) {
    for (const key of pairs) {
      if (out.length >= n) break;
      const [v, t] = key.split('|');
      if (!isValid(v, t)) continue;
      const pr = isImperative(t) ? nextI() : hasPerson(t) ? nextP() : 'il';
      const id = `${v}|${t}|${PRONOUNS[pr]}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({k: 'conj', v, t, pr});
    }
  }
  return out;
}

const BANKS = {gap: GAPS, voice: VOICE, compose: COMPOSE};

// Tire des phrases en évitant celles déjà vues : la pile restante est gardée d'une série à l'autre.
export function drawIds(bank, n, piles, rng = Math.random) {
  const all = BANKS[bank].map(x => x.id);
  let pile = (piles[bank] || []).filter(id => all.includes(id));
  const out = [];
  while (out.length < n) {
    if (!pile.length) pile = shuffle(all.filter(id => !out.includes(id)), rng);
    if (!pile.length) break;
    out.push(pile.pop());
  }
  return {ids: out, piles: {...piles, [bank]: pile}};
}

function questionsFor(bank, ids, rng) {
  if (bank === 'gap') return ids.map(id => ({k: 'gap', id}));
  if (bank === 'compose') return ids.map(id => ({k: 'compose', id}));
  // Moitié actif → passif, moitié passif → actif.
  const dirs = shuffle(ids.map((_, i) => (i % 2 ? 'a2p' : 'p2a')), rng);
  return ids.map((id, i) => ({k: 'voice', id, dir: dirs[i]}));
}

// Construit une série. Retourne les questions et les piles mises à jour.
export function buildSeries(type, {filter, piles = {}, errors = {}}, rng = Math.random) {
  if (type === 'conj') return {qs: buildConj(SERIES.conj.n, filter, rng), piles};
  if (type === 'review') return {qs: buildReview(errors, 20, rng), piles};
  if (type === 'test') {
    const conj = buildConj(8, defaultFilter(), rng);
    let p = piles, qs = [...conj];
    for (const [bank, n] of [['gap', 5], ['voice', 4], ['compose', 3]]) {
      const r = drawIds(bank, n, p, rng);
      p = r.piles;
      qs = qs.concat(questionsFor(bank, r.ids, rng));
    }
    return {qs: shuffle(qs, rng), piles: p};
  }
  const r = drawIds(type, SERIES[type].n, piles, rng);
  return {qs: questionsFor(type, r.ids, rng), piles: r.piles};
}

export const swissGrade = (score, total) => (total ? Math.round((1 + (5 * score) / total) * 2) / 2 : 1);
