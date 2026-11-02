import React from 'react';
import {ArrowLeft} from 'lucide-react';
import {VERBS, VERB_LIST, TENSES, MODES, displayForm, isValid, hasPerson, isImperative} from '../engine/verbs.js';
import {typo} from './meta.js';

const PERSONS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'], IMP = ['tu', 'nous', 'vous'];

export function TablesPage({verbId, go}) {
  const v = VERBS[verbId] || VERB_LIST[0];
  return <main className="page c1">
    <header className="page-head">
      <button type="button" className="back" onClick={() => go('/')}><ArrowLeft size={18}/> Sommaire</button>
      <p className="kicker">Aide</p>
      <h1>Tableaux des verbes</h1>
    </header>
    <div className="chips verb-picker">{VERB_LIST.map(x => <button key={x.id} type="button" aria-pressed={x.id === v.id} className={`chip${x.id === v.id ? ' on' : ''}`} onClick={() => go(`/tables/${x.id}`)}>{x.inf}</button>)}</div>
    <h2 className="verb-title">{v.inf}</h2>
    <p className="verb-note">{typo(v.note)}</p>
    {MODES.map(mode => <section key={mode} className="mode-block">
      <h3>{mode}</h3>
      <div className="tense-grid">
        {TENSES.filter(t => t.mode === mode).map(t => {
          if (!isValid(v.id, t.id)) return <div className="tense-card" key={t.id}><h4>{t.label}</h4><p className="small">Ce verbe n'a pas d'impératif.</p></div>;
          const prs = !hasPerson(t.id) ? ['il'] : isImperative(t.id) ? IMP : PERSONS;
          return <div className="tense-card" key={t.id}>
            <h4>{t.label}</h4>
            <ul>{prs.map(pr => <li key={pr}>{typo(displayForm(v.id, t.id, pr))}</li>)}</ul>
          </div>;
        })}
      </div>
    </section>)}
  </main>;
}

const FORMS = [
  ['présent', 'passé composé', "j'ai dit", 'je suis allé(e)', 'il est lu → il a été lu'],
  ['imparfait', 'plus-que-parfait', "j'avais dit", "j'étais allé(e)", 'il était lu → il avait été lu'],
  ['passé simple', 'passé antérieur', "j'eus dit", 'je fus allé(e)', 'il fut lu → il eut été lu'],
  ['futur simple', 'futur antérieur', "j'aurai dit", 'je serai allé(e)', 'il sera lu → il aura été lu'],
  ['conditionnel présent', 'conditionnel passé', "j'aurais dit", 'je serais allé(e)', 'il serait lu → il aurait été lu'],
  ['subjonctif présent', 'subjonctif passé', "que j'aie dit", 'que je sois allé(e)', "qu'il soit lu → qu'il ait été lu"],
  ['impératif présent', 'impératif passé', 'aie dit', 'sois allé(e)', ''],
  ['gérondif présent', 'gérondif passé', 'en ayant dit', 'en étant allé(e)', ''],
];

export function AidePage({go}) {
  return <main className="page c2">
    <header className="page-head">
      <button type="button" className="back" onClick={() => go('/')}><ArrowLeft size={18}/> Sommaire</button>
      <p className="kicker">Aide</p>
      <h1>Les règles à connaître</h1>
    </header>
    <div className="cours-body">
      <h2 className="cours-h">Temps simples et temps composés</h2>
      <p className="cours-p">Chaque temps simple a son temps composé : l'auxiliaire prend le temps simple, puis on ajoute le participe passé. L'auxiliaire est avoir pour presque tous ces verbes, et être pour aller : le participe s'accorde alors avec le sujet.</p>
      <div className="table-scroll"><table className="cours-table">
        <thead><tr><th>Temps simple</th><th>Temps composé</th><th>Avoir</th><th>Être</th><th>Au passif</th></tr></thead>
        <tbody>{FORMS.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{typo(c)}</td>)}</tr>)}</tbody>
      </table></div>

      <h2 className="cours-h">La concordance des temps</h2>
      <div className="method"><div className="box-title">Après si</div>
        <ul>
          <li>Si + présent → futur : si tu lis ce livre, tu comprendras.</li>
          <li>Si + imparfait → conditionnel présent : si tu lisais ce livre, tu comprendrais.</li>
          <li>Si + plus-que-parfait → conditionnel passé : si tu avais lu ce livre, tu aurais compris.</li>
        </ul>
        <p className="small">Jamais de conditionnel juste après si.</p>
      </div>
      <div className="method"><div className="box-title">Quand une action se passe avant l'autre</div>
        <ul>
          <li>Futur antérieur + futur : quand tu auras lu ce livre, tu me le prêteras.</li>
          <li>Plus-que-parfait + imparfait : quand il avait bu son thé, il partait.</li>
          <li>Passé antérieur + passé simple : dès qu'il eut ouvert, le chat s'échappa.</li>
        </ul>
      </div>
      <div className="method"><div className="box-title">Quand le verbe principal est au passé</div>
        <ul>
          <li>Action en même temps : imparfait. Il a dit qu'il pouvait venir.</li>
          <li>Action plus ancienne : plus-que-parfait. Il a dit qu'il avait reçu la lettre.</li>
          <li>Action à venir : conditionnel présent. Il a dit qu'il irait à Genève.</li>
        </ul>
      </div>
      <div className="method"><div className="box-title">Avec le subjonctif</div>
        <ul>
          <li>Il faut que, vouloir que, bien que, pour que, avant que, à moins que, douter que, regretter que... + subjonctif.</li>
          <li>Subjonctif présent si l'action est en même temps ou après ; subjonctif passé si elle est déjà terminée.</li>
          <li>Après que + indicatif : après qu'il a lu, après qu'il eut lu. Avant que + subjonctif : avant qu'il lise.</li>
        </ul>
      </div>

      <h2 className="cours-h">Passer de l'actif au passif</h2>
      <div className="method">
        <ol>
          <li>L'objet direct devient le sujet : le chat boit <u>le lait</u> → <u>le lait</u> est bu.</li>
          <li>Le sujet devient complément d'agent, avec par (parfois de) : ... par le chat.</li>
          <li>Être prend le temps du verbe actif : a lu → a été lu, lira → sera lu.</li>
          <li>Le participe passé s'accorde avec le nouveau sujet : la lettre est lue.</li>
        </ol>
      </div>
      <div className="tip"><div className="box-title">Le cas de on</div>Si le sujet actif est on, le passif n'a pas de complément d'agent : on a ouvert les fenêtres → les fenêtres ont été ouvertes. Et dans l'autre sens, sans complément d'agent, le sujet actif est on.</div>
      <div className="warn"><div className="box-title">Pas de passif</div>Un verbe sans objet direct ne se met pas au passif : aller et pouvoir, ni souffrir dans son sens habituel.</div>

      <h2 className="cours-h">Les orthographes acceptées</h2>
      <p className="cours-p">L'appli accepte aussi l'orthographe rectifiée de 1990 : j'assiègerai à côté de j'assiégerai, mu à côté de mû. Elle accepte je puis à côté de je peux.</p>
    </div>
  </main>;
}
