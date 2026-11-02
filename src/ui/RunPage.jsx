import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, Check, X, ChevronRight, Lightbulb, RefreshCw, RotateCcw, Play, ChevronDown} from 'lucide-react';
import {TYPES, typo} from './meta.js';
import {VERBS, VERB_LIST, TENSES, MODES, PERSON_LABEL, TENSE, COMPOSED_OF, hasPerson, isImperative, shortTense, auTemps, FORMATION, isValid} from '../engine/verbs.js';
import {grade, pairsOf} from '../engine/grade.js';
import {buildSeries, swissGrade, defaultFilter} from '../engine/series.js';
import {GAP_BY_ID} from '../content/gaps.js';
import {VOICE_BY_ID} from '../content/voice.js';
import {COMPOSE_BY_ID} from '../content/compose.js';

const ACCENTS = ['é', 'è', 'ê', 'à', 'â', 'î', 'ï', 'ô', 'û', 'ù', 'ç', 'œ'];

// Barre d'accents : insère le caractère dans le dernier champ actif, sans lui faire perdre le focus.
function AccentBar({targetRef}) {
  const insert = ch => {
    const el = targetRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length, end = el.selectionEnd ?? el.value.length;
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, el.value.slice(0, start) + ch + el.value.slice(end));
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.focus();
    el.setSelectionRange(start + ch.length, start + ch.length);
  };
  return <div className="accent-bar" role="group" aria-label="Lettres accentuées">
    {ACCENTS.map(c => <button key={c} type="button" tabIndex={-1} onPointerDown={e => e.preventDefault()} onClick={() => insert(c)}>{c}</button>)}
  </div>;
}

const inputProps = {autoComplete: 'off', autoCorrect: 'off', autoCapitalize: 'off', spellCheck: false};

function initialValue(q) {
  if (q.k === 'gap') return GAP_BY_ID[q.id].gaps.map(() => '');
  if (q.k === 'compose') return COMPOSE_BY_ID[q.id].s;
  return '';
}
const isEmpty = (q, value) => (q.k === 'gap' ? value.some(x => !x.trim()) : !value.trim());

function pronounHint(q) {
  const pr = q.pr === 'je' ? "je, j'" : q.pr;
  if (TENSE[q.t].mode !== 'Subjonctif') return typo(pr);
  return typo(/^(il|elle|on|ils|elles)$/.test(q.pr) ? `qu'${q.pr}` : `que ${pr}`);
}

// ---------- Énoncés ----------
function ConjPrompt({q}) {
  const t = TENSE[q.t];
  return <div className="conj-card">
    <div className="conj-verb">{VERBS[q.v].inf}</div>
    <div className="conj-tags">
      <span className="tag tag-tense">{t.mode} {t.label}</span>
      {hasPerson(q.t)
        ? <span className="tag">{q.pr}<small>{PERSON_LABEL[q.pr]}</small></span>
        : <span className="tag"><small>pas de personne</small></span>}
    </div>
  </div>;
}

function GapSentence({q, value, setValue, result, firstRef, onEnter, trackFocus}) {
  const item = GAP_BY_ID[q.id];
  const parts = item.text.split(/(\{\d\})/);
  return <p className="gap-sentence">
    {parts.map((part, i) => {
      const m = part.match(/^\{(\d)\}$/);
      if (!m) return <span key={i}>{typo(part)}</span>;
      const n = +m[1], spec = item.gaps[n], r = result?.gaps?.[n];
      if (r) return <span key={i} className={`gap-done ${r.ok ? 'right' : 'wrong'}`}>{value[n] || '...'}</span>;
      return <span className="gap-field" key={i}>
        <input ref={n === 0 ? firstRef : undefined} aria-label={`Verbe ${VERBS[spec[0]].inf}`} placeholder={VERBS[spec[0]].inf} value={value[n]} {...inputProps}
          onFocus={e => trackFocus(e.target)}
          onChange={e => setValue(value.map((x, j) => (j === n ? e.target.value : x)))}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } }}/>
      </span>;
    })}
  </p>;
}

function SentencePrompt({q}) {
  if (q.k === 'voice') {
    const it = VOICE_BY_ID[q.id];
    const toPassive = q.dir === 'a2p';
    return <div>
      <p className="task-label">{toPassive ? 'Mets cette phrase au passif' : "Mets cette phrase à l'actif"}</p>
      <p className="source-sentence">{typo(toPassive ? it.a : it.p)}</p>
    </div>;
  }
  const it = COMPOSE_BY_ID[q.id];
  return <div>
    <p className="task-label">Mets le verbe au temps composé <span className={`voice-tag ${it.voice}`}>{it.voice}</span></p>
    <p className="source-sentence">{typo(it.s)}</p>
  </div>;
}

// ---------- Corrigé ----------
function Feedback({q, result}) {
  return <div className={`feedback-box ${result.ok ? 'right' : 'wrong'}`} role="status">
    <div className="fb-title">{result.ok ? <><Check size={18}/> Juste</> : <><X size={18}/> Pas tout à fait</>}</div>
    {q.k === 'gap' && result.gaps.map((g, i) => !g.ok && <div key={i} className="fb-model">
      <span className="fb-label">{VERBS[g.verb].inf}</span> <strong>{typo(g.model)}</strong>
      {g.also?.length > 0 && <span className="fb-also"> (ou {typo(g.also[0])})</span>}
      <span className="fb-tense"> · {shortTense(g.tense)}</span>
      {g.message && <p className="fb-msg">{typo(g.message)}</p>}
    </div>)}
    {q.k === 'gap' && result.ok && result.gaps.map((g, i) => <div key={i} className="fb-tense-line">{VERBS[g.verb].inf} : {shortTense(g.tense)}</div>)}
    {q.k === 'conj' && <div className="fb-model"><strong>{typo(result.model)}</strong></div>}
    {(q.k === 'voice' || q.k === 'compose') && !result.ok && <div className="fb-model"><strong>{typo(result.model)}</strong></div>}
    {result.diff && <p className="fb-diff"><span className="fb-label">Ta réponse :</span> {result.diff.map((d, i) => <span key={i} className={d.ok ? '' : 'bad-word'}>{d.w} </span>)}</p>}
    {q.k !== 'gap' && result.message && <p className="fb-msg">{typo(result.message)}</p>}
    {result.rule?.length > 0 && <ul className="fb-rules">{result.rule.map((r, i) => <li key={i}>{typo(r)}</li>)}</ul>}
  </div>;
}

function hintOf(q) {
  if (q.k === 'conj') {
    const f = FORMATION[q.t];
    return [f && `${shortTense(q.t)} : ${f}.`, VERBS[q.v].note].filter(Boolean);
  }
  if (q.k === 'gap') return [GAP_BY_ID[q.id].rule];
  if (q.k === 'voice') {
    const it = VOICE_BY_ID[q.id];
    return [q.dir === 'a2p'
      ? "Commence par trouver l'objet : il devient le sujet. Être prend le temps du verbe actif."
      : "Le complément d'agent devient le sujet. S'il n'y en a pas, le sujet est on.", `Temps de la phrase : ${shortTense(it.t)}.`];
  }
  const it = COMPOSE_BY_ID[q.id];
  return [`Le verbe est ${it.voice === 'passif' ? 'au passif, ' : ''}${auTemps(it.t)}.`, `${shortTense(COMPOSED_OF[it.t])} : ${FORMATION[COMPOSED_OF[it.t]]}.`];
}

// ---------- Une question ----------
function Question({q, index, total, onDone, exam}) {
  const [value, setValue] = useState(() => initialValue(q));
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const fieldRef = useRef(null), lastFocus = useRef(null), nextRef = useRef(null);

  useEffect(() => { // le champ reçoit le focus à chaque nouvelle question
    const el = fieldRef.current;
    if (el) { el.focus(); lastFocus.current = el; if (q.k === 'compose') el.setSelectionRange(el.value.length, el.value.length); }
  }, [q]);
  useEffect(() => { if (result) nextRef.current?.focus(); }, [result]);

  const check = () => {
    if (isEmpty(q, value) || result) return;
    setResult(grade(q, value));
  };
  const next = () => onDone(value, result.ok);
  const track = el => { lastFocus.current = el; };

  return <section className="question" aria-label={`Question ${index + 1} sur ${total}`}>
    {q.k === 'conj' && <ConjPrompt q={q}/>}
    {q.k === 'gap' && <div>
      <p className="task-label">Conjugue le verbe au temps qui convient</p>
      <GapSentence q={q} value={value} setValue={setValue} result={result} firstRef={fieldRef} onEnter={check} trackFocus={track}/>
    </div>}
    {(q.k === 'voice' || q.k === 'compose') && <SentencePrompt q={q}/>}

    {q.k === 'conj' && !result && <div className="answer-line">
      {hasPerson(q.t) && !isImperative(q.t) && <span className="pronoun-hint">{pronounHint(q)}</span>}
      <input ref={fieldRef} aria-label="Ta réponse" value={value} {...inputProps} onFocus={e => track(e.target)} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); check(); } }} placeholder="ta réponse"/>
    </div>}
    {q.k === 'conj' && result && <p className={`typed ${result.ok ? 'right' : 'wrong'}`}>{value}</p>}

    {(q.k === 'voice' || q.k === 'compose') && !result && <textarea ref={fieldRef} className="sentence-input" rows={3} aria-label="Ta phrase" value={value} {...inputProps} onFocus={e => track(e.target)} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); check(); } }} placeholder="Écris la phrase ici"/>}

    {!result && <AccentBar targetRef={lastFocus}/>}

    {!result && <div className="tool-row">
      <button type="button" className="btn-check" disabled={isEmpty(q, value)} onClick={check}>Vérifier</button>
      {!exam && <button type="button" className={`btn-ghost${showHint ? ' on' : ''}`} onClick={() => setShowHint(s => !s)}><Lightbulb size={16}/> Indice</button>}
      {q.k === 'compose' && <button type="button" className="btn-ghost" onClick={() => setValue(initialValue(q))}><RotateCcw size={16}/> Repartir de la phrase</button>}
    </div>}
    {!result && showHint && <ul className="hint">{hintOf(q).filter(Boolean).map((h, i) => <li key={i}>{typo(h)}</li>)}</ul>}

    {result && <Feedback q={q} result={result}/>}
    {result && <div className="next-row"><button ref={nextRef} type="button" className="btn-primary" onClick={next}>{index + 1 === total ? 'Voir le résultat' : 'Question suivante'} <ChevronRight size={18}/></button></div>}
  </section>;
}

// ---------- Réglages ----------
function FilterPanel({filter, setFilter}) {
  const [open, setOpen] = useState(false);
  const toggle = (key, id) => {
    const has = filter[key].includes(id);
    setFilter({...filter, [key]: has ? filter[key].filter(x => x !== id) : [...filter[key], id]});
  };
  const setMode = (mode, on) => {
    const ids = TENSES.filter(t => t.mode === mode && !t.optional).map(t => t.id);
    const rest = filter.tenses.filter(x => !ids.includes(x));
    setFilter({...filter, tenses: on ? [...rest, ...ids] : rest});
  };
  const partial = filter.verbs.length < VERB_LIST.length || filter.tenses.length !== defaultFilter().tenses.length;
  return <div className="filter">
    <button type="button" className="filter-toggle" aria-expanded={open} onClick={() => setOpen(o => !o)}>
      <span>Choisir les verbes et les temps <small>{filter.verbs.length} verbes, {filter.tenses.length} temps</small></span>
      <ChevronDown size={18} className={open ? 'rot' : ''}/>
    </button>
    {open && <div className="filter-body">
      <h3>Verbes</h3>
      <div className="chips">{VERB_LIST.map(v => <button key={v.id} type="button" aria-pressed={filter.verbs.includes(v.id)} className={`chip${filter.verbs.includes(v.id) ? ' on' : ''}`} onClick={() => toggle('verbs', v.id)}>{v.inf}</button>)}</div>
      <h3>Temps</h3>
      {MODES.map(mode => {
        const list = TENSES.filter(t => t.mode === mode);
        const allOn = list.filter(t => !t.optional).every(t => filter.tenses.includes(t.id));
        return <div className="mode-row" key={mode}>
          <button type="button" className="mode-name" onClick={() => setMode(mode, !allOn)}>{mode}</button>
          <div className="chips">{list.map(t => <button key={t.id} type="button" aria-pressed={filter.tenses.includes(t.id)} className={`chip${filter.tenses.includes(t.id) ? ' on' : ''}`} onClick={() => toggle('tenses', t.id)}>{t.label}</button>)}</div>
        </div>;
      })}
      {partial && <button type="button" className="btn-ghost" onClick={() => setFilter(defaultFilter())}><RotateCcw size={16}/> Tout remettre</button>}
    </div>}
  </div>;
}

// ---------- Résultat ----------
function Results({run, onNew, onRetry, go}) {
  const total = run.qs.length;
  const score = run.answers.filter(a => a.ok).length;
  const wrong = run.qs.map((q, i) => ({q, a: run.answers[i]})).filter(x => !x.a.ok);
  return <div className="results">
    <div className="result-box">
      <strong>{score} / {total}</strong>
      <span>Note indicative : {swissGrade(score, total).toFixed(1).replace('.', ',')}</span>
    </div>
    {wrong.length > 0 && <>
      <h2 className="errors-title">À revoir ({wrong.length})</h2>
      <ol className="error-list">{wrong.map(({q, a}, i) => {
        const r = grade(q, a.value);
        return <li key={i}><ErrorLine q={q} a={a} r={r}/></li>;
      })}</ol>
    </>}
    <div className="series-foot">
      <button type="button" className="btn-secondary" onClick={() => go('/')}>Sommaire</button>
      {wrong.length > 0 && <button type="button" className="btn-secondary" onClick={onRetry}><RotateCcw size={16}/> Refaire mes erreurs</button>}
      <button type="button" className="btn-primary" onClick={onNew}><RefreshCw size={16}/> Nouvelle série</button>
    </div>
  </div>;
}

function ErrorLine({q, a, r}) {
  if (q.k === 'conj') return <>
    <p className="err-q">{VERBS[q.v].inf} · {shortTense(q.t)}</p>
    <p><span className="bad-word">{a.value}</span> → <strong>{typo(r.model)}</strong></p>
  </>;
  if (q.k === 'gap') {
    const it = GAP_BY_ID[q.id];
    return <>
      <p className="err-q">{typo(it.text.replace(/\{(\d)\}/g, (_, n) => `(${VERBS[it.gaps[+n][0]].inf})`))}</p>
      {r.gaps.map((g, i) => !g.ok && <p key={i}><span className="bad-word">{a.value[i] || '...'}</span> → <strong>{typo(g.model)}</strong> <span className="small">({shortTense(g.tense)})</span></p>)}
    </>;
  }
  return <>
    <p className="err-q">{typo(q.k === 'compose' ? COMPOSE_BY_ID[q.id].s : (q.dir === 'a2p' ? VOICE_BY_ID[q.id].a : VOICE_BY_ID[q.id].p))}</p>
    <p><strong>{typo(r.model)}</strong></p>
  </>;
}

// ---------- Page ----------
export default function RunPage({type, store, setStore, go}) {
  const m = TYPES[type];
  const run = store.runs[type];
  const exam = type === 'test';

  const start = (qs, piles) => setStore(s => ({...s, piles: piles || s.piles, runs: {...s.runs, [type]: {qs, answers: [], finished: false}}}));
  const newSeries = () => {
    const r = buildSeries(type, {filter: store.filter, piles: store.piles, errors: store.errors});
    start(r.qs, r.piles);
  };
  const retry = () => start(run.qs.filter((_, i) => !run.answers[i].ok));
  const abandon = () => setStore(s => { const runs = {...s.runs}; delete runs[type]; return {...s, runs}; });

  const answer = (value, ok) => setStore(s => {
    const cur = s.runs[type];
    const q = cur.qs[cur.answers.length];
    const answers = [...cur.answers, {value, ok}];
    const errors = {...s.errors};
    for (const key of pairsOf(q)) errors[key] = Math.max(0, (errors[key] || 0) + (ok ? -1 : 1));
    for (const k of Object.keys(errors)) if (!errors[k]) delete errors[k];
    return {...s, errors, runs: {...s.runs, [type]: {...cur, answers, finished: answers.length >= cur.qs.length}}};
  });

  const filterValid = useMemo(() => store.filter.verbs.some(v => store.filter.tenses.some(t => isValid(v, t))), [store.filter]);
  const canStart = type === 'conj' ? filterValid : type !== 'review' || Object.values(store.errors).some(n => n > 0);

  const index = run ? run.answers.length : 0;
  const total = run ? run.qs.length : 0;

  useEffect(() => { window.scrollTo({top: 0}); }, [index]);

  return <main className={`page ${m.cls}`}>
    <header className="page-head">
      <button type="button" className="back" onClick={() => go('/')}><ArrowLeft size={18}/> Sommaire</button>
      <p className="kicker">{m.num ? `Exercice ${m.num}` : 'Conjugaison'}</p>
      <h1>{m.title}</h1>
      {run && !run.finished && <div className="progress-line" style={{'--p': `${(index / total) * 100}%`}}>
        <span>Question {index + 1} / {total}</span><i/>
        <span>{run.answers.filter(a => a.ok).length} juste{run.answers.filter(a => a.ok).length > 1 ? 's' : ''}</span>
      </div>}
    </header>

    {!run && <div className="start">
      <p className="ex-intro">{typo(m.intro)}</p>
      {type === 'conj' && <FilterPanel filter={store.filter} setFilter={filter => setStore(s => ({...s, filter}))}/>}
      {type === 'review' && !canStart && <p className="warn-line">Aucun point faible pour l'instant. Reviens après une série !</p>}
      {type === 'conj' && !filterValid && <p className="warn-line">Choisis au moins un verbe et un temps qui vont ensemble (pouvoir n'a pas d'impératif).</p>}
      <button type="button" className="btn-primary start-btn" disabled={!canStart} onClick={newSeries}><Play size={17}/> Commencer</button>
    </div>}

    {run && !run.finished && run.qs[index] && <>
      <Question key={`${index}-${JSON.stringify(run.qs[index])}`} q={run.qs[index]} index={index} total={total} onDone={answer} exam={exam}/>
      <button type="button" className="quit-link" onClick={abandon}>Abandonner cette série</button>
    </>}

    {run && run.finished && <Results run={run} onNew={newSeries} onRetry={retry} go={go}/>}
  </main>;
}
