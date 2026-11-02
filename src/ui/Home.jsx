import React from 'react';
import {ChevronRight, GraduationCap, BookMarked, Table2, Target} from 'lucide-react';
import {TYPES, typo} from './meta.js';
import {VERBS, shortTense} from '../engine/verbs.js';

const progress = (store, t) => {
  const r = store.runs[t];
  if (!r || r.finished) return null;
  return `${r.answers.length} / ${r.qs.length} en cours`;
};

export default function Home({store, go}) {
  const weak = Object.entries(store.errors).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  return <main className="page home">
    <header className="home-head">
      <p className="kicker">11VG · Français</p>
      <h1>Conjugaison</h1>
      <p className="lead">Seize verbes, tous les temps, et plus de 140 phrases tirées au hasard. L'appli corrige, explique ton erreur et donne la règle.</p>
    </header>
    <ol className="toc">
      {['conj', 'gap', 'voice', 'compose'].map(t => {
        const m = TYPES[t], p = progress(store, t);
        return <li key={t}>
          <button type="button" className={`toc-ch ${m.cls}`} onClick={() => go(`/x/${t}`)}>
            <span className="ch-num">{m.num}</span>
            <span className="toc-text"><strong>{m.title}</strong><span>{typo(m.sub)}</span>{p && <em>{p}</em>}</span>
            <ChevronRight size={20}/>
          </button>
        </li>;
      })}
    </ol>
    <button type="button" className="master-card" onClick={() => go('/x/test')}>
      <GraduationCap size={30}/>
      <div><strong>Test mélangé</strong><span>{typo(TYPES.test.sub)}</span></div>
      <ChevronRight size={22}/>
    </button>
    {weak.length > 0 && <button type="button" className="weak-card c5" onClick={() => go('/x/review')}>
      <Target size={24}/>
      <div>
        <strong>Mes points faibles ({weak.length})</strong>
        <span>{typo(weak.slice(0, 4).map(([k]) => { const [v, t] = k.split('|'); return `${VERBS[v].inf} (${shortTense(t)})`; }).join(', '))}{weak.length > 4 ? '...' : ''}</span>
      </div>
      <ChevronRight size={20}/>
    </button>}
    <div className="links">
      <button type="button" className="aide-link" onClick={() => go('/tables')}><Table2 size={17}/> Tableaux des 16 verbes</button>
      <button type="button" className="aide-link" onClick={() => go('/aide')}><BookMarked size={17}/> Les règles à connaître</button>
    </div>
  </main>;
}
