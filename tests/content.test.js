import test from 'node:test';
import assert from 'node:assert/strict';
import {VERB_LIST, VERBS, TENSES, COMPOSED_OF, forms, passiveForm, acceptedConj, displayForm, isValid, hasPerson, isImperative, PRONOUNS} from '../src/engine/verbs.js';
import {GAPS} from '../src/content/gaps.js';
import {VOICE} from '../src/content/voice.js';
import {COMPOSE} from '../src/content/compose.js';
import {grade, normalize} from '../src/engine/grade.js';

const hasWords = (sentence, form) => ` ${normalize(sentence)} `.replace(/(qu|j|l|d|n)'/g, '$1 ').includes(` ${normalize(form)} `);

test('la banque contient au moins 100 phrases', () => {
  assert.ok(GAPS.length + VOICE.length + COMPOSE.length >= 100);
});

test('les 16 verbes demandés existent et sont tous utilisés dans les phrases à trous', () => {
  assert.equal(VERB_LIST.length, 16);
  const used = new Set(GAPS.flatMap(g => g.gaps.map(s => s[0])));
  for (const v of VERB_LIST) assert.ok(used.has(v.id), v.id);
});

test('aller, pouvoir et souffrir sont absents du passif', () => {
  for (const it of VOICE) assert.ok(!['aller', 'pouvoir', 'souffrir'].includes(it.v), it.id);
  for (const it of COMPOSE.filter(x => x.voice === 'passif')) assert.ok(!['aller', 'pouvoir', 'souffrir'].includes(it.v), it.id);
});

test('identifiants uniques', () => {
  for (const bank of [GAPS, VOICE, COMPOSE]) assert.equal(new Set(bank.map(x => x.id)).size, bank.length);
});

test('chaque trou a un repère et une réponse', () => {
  for (const g of GAPS) {
    g.gaps.forEach((spec, i) => {
      assert.ok(g.text.includes(`{${i}}`), g.id);
      assert.ok(forms(spec[0], spec[1], spec[2] || 'il', spec[3]).length > 0, g.id);
    });
    assert.ok(g.rule, g.id);
  }
});

test('actif / passif : les verbes écrits correspondent au moteur', () => {
  for (const it of VOICE) {
    const active = it.activeForm ? [it.activeForm] : forms(it.v, it.t, it.ap);
    assert.ok(active.some(f => hasWords(it.a, f)), `${it.id} actif : ${active} dans "${it.a}"`);
    const g = it.g || {il: 'ms', elle: 'fs', ils: 'mp', elles: 'fp'}[it.pp];
    const passive = passiveForm(it.v, it.t, it.pp, g);
    assert.ok(passive.some(f => hasWords(it.p, f)), `${it.id} passif : ${passive} dans "${it.p}"`);
  }
});

test('simple → composé : les verbes écrits correspondent au moteur', () => {
  for (const it of COMPOSE) {
    const composed = COMPOSED_OF[it.t];
    assert.ok(composed, it.id);
    if (it.voice === 'actif') {
      assert.ok(forms(it.v, it.t, it.pr, it.g).some(f => hasWords(it.s, f)), `${it.id} simple dans "${it.s}"`);
      const cf = forms(it.v, composed, it.pr, it.g);
      assert.ok(cf.some(f => hasWords(it.c, f)), `${it.id} composé : ${cf} dans "${it.c}"`);
    } else {
      const g = {il: 'ms', elle: 'fs', ils: 'mp', elles: 'fp'}[it.pr];
      assert.ok(passiveForm(it.v, it.t, it.pr, g).some(f => hasWords(it.s, f)), `${it.id} simple dans "${it.s}"`);
      assert.ok(passiveForm(it.v, composed, it.pr, g).some(f => hasWords(it.c, f)), `${it.id} composé dans "${it.c}"`);
    }
  }
});

test('la correction accepte la forme attendue, le pronom, que, et refuse les autres', () => {
  for (const v of VERB_LIST) for (const t of TENSES) {
    if (!isValid(v.id, t.id)) continue;
    const prs = hasPerson(t.id) ? (isImperative(t.id) ? ['tu', 'nous', 'vous'] : Object.keys(PRONOUNS)) : ['il'];
    for (const pr of prs) {
      const q = {k: 'conj', v: v.id, t: t.id, pr};
      for (const a of acceptedConj(v.id, t.id, pr)) assert.ok(grade(q, a).ok, `${v.id} ${t.id} ${pr} : ${a}`);
      assert.ok(displayForm(v.id, t.id, pr), `${v.id} ${t.id} ${pr}`);
      assert.equal(grade(q, 'xxx').ok, false);
    }
  }
});

test('quelques formes difficiles', () => {
  const ok = (v, t, pr, a) => assert.ok(grade({k: 'conj', v, t, pr}, a).ok, `${v} ${t} ${pr} ${a}`);
  const ko = (v, t, pr, a) => assert.equal(grade({k: 'conj', v, t, pr}, a).ok, false, `${v} ${t} ${pr} ${a}`);
  ok('dire', 'present', 'vous', 'dites'); ko('dire', 'present', 'vous', 'disez');
  ok('recevoir', 'passe_simple', 'nous', 'reçûmes'); ko('recevoir', 'present', 'je', 'recois');
  ok('aller', 'passe_compose', 'elle', 'elle est allée'); ko('aller', 'passe_compose', 'elle', 'est allé');
  ok('aller', 'passe_compose', 'je', "je suis allée"); ok('aller', 'futur', 'je', "j'irai");
  ok('aller', 'subj_passe', 'il', "qu'il soit allé"); ok('aller', 'imp_passe', 'nous', 'soyons allés');
  ok('assieger', 'futur', 'je', 'assiégerai'); ok('assieger', 'futur', 'je', 'assiègerai');
  ok('assieger', 'imparfait', 'nous', 'assiégions'); ok('assieger', 'present', 'nous', 'assiégeons');
  ok('mouvoir', 'part_passe', 'il', 'mû'); ok('mouvoir', 'part_passe', 'il', 'mu');
  ok('mouvoir', 'present', 'ils', 'meuvent'); ok('pouvoir', 'present', 'je', 'puis');
  ok('pouvoir', 'cond_passe2', 'il', 'eût pu'); ok('lire', 'ger_passe', 'il', 'en ayant lu');
  ok('aller', 'ger_passe', 'il', 'en étant allée'); ko('lire', 'ger_present', 'il', 'lisant');
  ok('peser', 'futur', 'nous', 'pèserons'); ko('peser', 'futur', 'nous', 'peserons');
  ko('boire', 'imp_present', 'tu', 'tu bois');
  assert.equal(isValid('pouvoir', 'imp_present'), false);
  assert.equal(displayForm('aller', 'passe_compose', 'je'), 'je suis allé(e)');
  assert.equal(displayForm('ouvrir', 'futur', 'je'), "j'ouvrirai");
  assert.equal(displayForm('offrir', 'subj_present', 'elle'), "qu'elle offre");
});

test('toute phrase modèle est acceptée par la correction', () => {
  for (const it of VOICE) {
    assert.ok(grade({k: 'voice', id: it.id, dir: 'a2p'}, it.p).ok, it.id);
    assert.ok(grade({k: 'voice', id: it.id, dir: 'p2a'}, it.a).ok, it.id);
    assert.ok(grade({k: 'voice', id: it.id, dir: 'a2p'}, it.p.replace(/\.$/, '').toUpperCase()).ok, it.id);
  }
  for (const it of COMPOSE) {
    assert.ok(grade({k: 'compose', id: it.id}, it.c).ok, it.id);
    assert.equal(grade({k: 'compose', id: it.id}, it.s).ok, false, it.id);
  }
  for (const g of GAPS) {
    const answers = g.gaps.map(s => forms(s[0], s[1], s[2] || 'il', s[3])[0]);
    assert.ok(grade({k: 'gap', id: g.id}, answers).ok, g.id);
  }
});

test('les indices de diagnostic restent lisibles', () => {
  const r = grade({k: 'conj', v: 'lire', t: 'futur', pr: 'ils'}, 'liraient');
  assert.match(r.message, /conditionnel présent/);
  const a = grade({k: 'conj', v: 'recevoir', t: 'present', pr: 'je'}, 'recois');
  assert.match(a.message, /accents/);
  const p = grade({k: 'conj', v: 'lire', t: 'present', pr: 'ils'}, 'lisons');
  assert.match(p.message, /personne/);
});
