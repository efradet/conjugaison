import {VERBS, TENSE, acceptedConj, forms, allFormsOf, displayForm, shortTense, auTemps, leTemps, hasPerson, isImperative, FORMATION, COMPOSED_OF} from './verbs.js';
import {GAP_BY_ID} from '../content/gaps.js';
import {VOICE_BY_ID} from '../content/voice.js';
import {COMPOSE_BY_ID} from '../content/compose.js';

// ---------- Comparaison du texte saisi ----------
export const normalize = s => (s || '')
  .toLowerCase()
  .replace(/[’`´]/g, "'")
  .replace(/œ/g, 'oe')
  .replace(/\s*'\s*/g, "'")
  .replace(/[.,;:!?…«»"]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
export const stripAccents = s => normalize(s).normalize('NFD').replace(/[̀-ͯ]/g, '');

const hasAny = (list, value) => list.some(x => normalize(x) === normalize(value));
const hasAnyNoAccent = (list, value) => list.some(x => stripAccents(x) === stripAccents(value));

const ACCENT_MSG = "Presque ! C'est juste sans les accents ou la cédille : regarde bien où ils se placent.";

// ---------- Diagnostic : la réponse est-elle une autre forme du même verbe ? ----------
function diagnoseOtherForm(verbId, wantTense, wantPr, value) {
  const clean = normalize(value).replace(/^que /, '').replace(/^qu'/, '').replace(/^(je|tu|il|elle|on|nous|vous|ils|elles) /, '').replace(/^j'/, '');
  const hits = allFormsOf(verbId).filter(f => normalize(f.form) === clean);
  if (!hits.length) return null;
  const wantIdx = {je: 'je', tu: 'tu', il: 'il', elle: 'il', on: 'il', nous: 'nous', vous: 'vous', ils: 'ils', elles: 'ils'}[wantPr];
  const sameTense = hits.find(h => h.t === wantTense);
  if (sameTense) return `Bon temps, mais c'est la forme de « ${sameTense.pr} ». Il faut ici la personne « ${wantPr} ».`;
  const samePerson = hits.find(h => h.pr === wantIdx) || hits[0];
  return `Ta réponse est ${auTemps(samePerson.t)}. Il fallait ${leTemps(wantTense)}.`;
}

function tenseHelp(t) {
  const f = FORMATION[t];
  return f ? `${shortTense(t).replace(/^./, c => c.toUpperCase())} : ${f}.` : '';
}

export function gradeConj(q, value) {
  const {v, t, pr} = q;
  const accepted = acceptedConj(v, t, pr);
  const model = displayForm(v, t, pr);
  const base = {model, rule: [tenseHelp(t), VERBS[v].note].filter(Boolean)};
  if (hasAny(accepted, value)) return {...base, ok: true};
  if (TENSE[t].kind.startsWith('ger') && hasAny(accepted.map(a => a.replace(/^en /, '')), value)) {
    return {...base, ok: false, message: 'Le gérondif se construit toujours avec en.'};
  }
  if (isImperative(t) && hasAny(accepted.map(a => `${pr} ${a}`), value)) {
    return {...base, ok: false, message: "À l'impératif, on ne met pas de pronom sujet."};
  }
  if (hasAnyNoAccent(accepted, value)) return {...base, ok: false, message: ACCENT_MSG};
  const other = diagnoseOtherForm(v, t, hasPerson(t) ? pr : 'il', value);
  return {...base, ok: false, message: other || null};
}

// ---------- Phrases à trous ----------
export function gapForms(spec) {
  const [v, t, pr, g] = spec;
  return forms(v, t, pr, g);
}
export function gradeGaps(q, values) {
  const item = GAP_BY_ID[q.id];
  const results = item.gaps.map((spec, i) => {
    const main = gapForms(spec);
    const extra = (item.also?.[i] || []).flatMap(gapForms);
    const value = values?.[i] || '';
    const ok = hasAny([...main, ...extra], value);
    let message = null;
    if (!ok && value.trim()) {
      if (hasAnyNoAccent([...main, ...extra], value)) message = ACCENT_MSG;
      else if (TENSE[spec[1]].kind.startsWith('ger') && hasAny(main.map(a => a.replace(/^en /, '')), value)) message = 'Le gérondif se construit avec en.';
      else message = diagnoseOtherForm(spec[0], spec[1], hasPerson(spec[1]) ? spec[2] : 'il', value);
    }
    return {ok, model: main[0], message, tense: spec[1], verb: spec[0], also: (item.also?.[i] || []).flatMap(gapForms)};
  });
  return {ok: results.every(r => r.ok), gaps: results, rule: [item.rule], model: null};
}

// ---------- Phrases entières ----------
function wordDiff(answer, model) {
  const a = normalize(answer).split(' ').filter(Boolean);
  const b = normalize(model).split(' ').filter(Boolean);
  const dp = Array.from({length: a.length + 1}, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < a.length) {
    if (j < b.length && a[i] === b[j]) { out.push({w: a[i], ok: true}); i++; j++; }
    else if (j < b.length && dp[i][j + 1] > dp[i + 1][j]) j++;
    else { out.push({w: a[i], ok: false}); i++; }
  }
  return out;
}

function closest(list, value) {
  let best = list[0], score = -1;
  for (const m of list) {
    const d = wordDiff(value, m).filter(x => x.ok).length;
    if (d > score) { best = m; score = d; }
  }
  return best;
}

function sentenceDiagnosis(modelList, value) {
  if (hasAnyNoAccent(modelList, value)) return ACCENT_MSG;
  const noAgree = s => stripAccents(s).split(' ').map(w => w.replace(/(es|e|s)$/, '')).join(' ');
  if (modelList.some(m => noAgree(m) === noAgree(value))) return "Presque ! Vérifie les accords : participe passé et sujet, ou terminaison du verbe.";
  return null;
}

export function gradeVoice(q, value) {
  const item = VOICE_BY_ID[q.id];
  const toPassive = q.dir === 'a2p';
  const main = toPassive ? item.p : item.a;
  const list = toPassive ? [main, ...(item.alt || [])] : [main];
  const rule = [toPassive
    ? `Le verbe actif est ${auTemps(item.t)} : être prend ce temps, puis on ajoute le participe passé accordé avec le nouveau sujet.`
    : (item.on ? `Le passif est ${auTemps(item.t)}, donc le verbe actif aussi. Sans complément d'agent, le sujet actif est on.` : `Le passif est ${auTemps(item.t)}, donc le verbe actif aussi. Le complément d'agent devient le sujet.`)];
  if (hasAny(list, value)) return {ok: true, model: main, rule, diff: null};
  return {ok: false, model: main, rule, message: sentenceDiagnosis(list, value), diff: wordDiff(value, closest(list, value))};
}

export function gradeCompose(q, value) {
  const item = COMPOSE_BY_ID[q.id];
  const list = [item.c, ...(item.alt || [])];
  const composed = COMPOSED_OF[item.t];
  const cap = x => x.replace(/^./, c => c.toUpperCase());
  const rule = [item.voice === 'passif'
    ? `${cap(shortTense(item.t))} → ${shortTense(composed)}. Au passif, c'est être qui passe au temps composé (a été, avait été, aura été...), suivi du participe passé accordé.`
    : `${cap(shortTense(item.t))} → ${shortTense(composed)} : ${FORMATION[composed]}.`];
  if (hasAny(list, value)) return {ok: true, model: item.c, rule, diff: null};
  return {ok: false, model: item.c, rule, message: sentenceDiagnosis(list, value), diff: wordDiff(value, closest(list, value))};
}

export function grade(q, value) {
  switch (q.k) {
    case 'conj': return gradeConj(q, value);
    case 'gap': return gradeGaps(q, value);
    case 'voice': return gradeVoice(q, value);
    case 'compose': return gradeCompose(q, value);
    default: throw new Error(`question inconnue : ${q.k}`);
  }
}

// Paires verbe + temps à retenir pour "mes points faibles".
export function pairsOf(q) {
  if (q.k === 'conj') return [`${q.v}|${q.t}`];
  if (q.k === 'gap') return GAP_BY_ID[q.id].gaps.map(s => `${s[0]}|${s[1]}`);
  return [];
}
