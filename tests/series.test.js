import test from 'node:test';
import assert from 'node:assert/strict';
import {buildConj, buildSeries, buildReview, defaultFilter, drawIds, swissGrade} from '../src/engine/series.js';
import {isValid, isImperative, TENSES, VERB_LIST} from '../src/engine/verbs.js';
import {grade} from '../src/engine/grade.js';

function seeded(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

test('20 questions valides, sans doublon, qui varient', () => {
  const seen = new Set();
  for (let s = 1; s <= 200; s++) {
    const qs = buildConj(20, defaultFilter(), seeded(s));
    assert.equal(qs.length, 20);
    const keys = qs.map(q => `${q.v}|${q.t}|${q.pr}`);
    assert.equal(new Set(keys).size, 20);
    for (const q of qs) {
      assert.ok(isValid(q.v, q.t), q.v + q.t);
      if (isImperative(q.t)) assert.ok(['tu', 'nous', 'vous'].includes(q.pr));
    }
    assert.ok(new Set(qs.map(q => q.t)).size >= 15, `seed ${s} : temps trop peu variés`);
    assert.ok(new Set(qs.map(q => q.v)).size >= 12, `seed ${s} : verbes trop peu variés`);
    seen.add(keys.join());
  }
  assert.equal(seen.size, 200);
});

test('la 2e forme du conditionnel passé est optionnelle', () => {
  assert.ok(!defaultFilter().tenses.includes('cond_passe2'));
  assert.equal(defaultFilter().tenses.length, TENSES.length - 1);
  assert.equal(defaultFilter().verbs.length, VERB_LIST.length);
});

test('filtre étroit : pas de boucle infinie, pas de question impossible', () => {
  const qs = buildConj(20, {verbs: ['pouvoir'], tenses: ['imp_present']}, seeded(3));
  assert.equal(qs.length, 0);
  const one = buildConj(20, {verbs: ['lire'], tenses: ['futur']}, seeded(3));
  assert.equal(one.length, 6);
});

test('les phrases ne reviennent pas avant la fin de la pile', () => {
  let piles = {}, all = [];
  for (let i = 0; i < 6; i++) {
    const r = drawIds('gap', 10, piles, seeded(i + 1));
    piles = r.piles;
    assert.equal(new Set(r.ids).size, 10);
    all = all.concat(r.ids);
  }
  assert.equal(new Set(all).size, 60);
});

test('test mélangé : les quatre types, et chaque question est corrigeable', () => {
  for (let s = 1; s <= 50; s++) {
    const {qs} = buildSeries('test', {filter: defaultFilter()}, seeded(s));
    assert.equal(qs.length, 20);
    assert.deepEqual([...new Set(qs.map(q => q.k))].sort(), ['compose', 'conj', 'gap', 'voice']);
    for (const q of qs) assert.equal(typeof grade(q, q.k === 'gap' ? ['x', 'y'] : 'x').ok, 'boolean');
  }
});

test('révision des erreurs', () => {
  const qs = buildReview({'lire|futur': 2, 'pouvoir|imp_present': 1}, 20, seeded(1));
  assert.ok(qs.length > 0);
  assert.ok(qs.every(q => q.v === 'lire' && q.t === 'futur'));
});

test('note suisse', () => {
  assert.equal(swissGrade(20, 20), 6);
  assert.equal(swissGrade(0, 20), 1);
  assert.equal(swissGrade(12, 20), 4);
});
