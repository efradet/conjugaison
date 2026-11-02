// Tables de conjugaison. Une forme "a|b" donne deux orthographes acceptées (la première est affichée).
// Les temps composés ne sont pas écrits à la main : ils sont calculés (auxiliaire + participe passé).

const six = (a, b, c, d, e, f) => [a, b, c, d, e, f];
const imparfait = r => six(`${r}ais`, `${r}ais`, `${r}ait`, `${r}ions`, `${r}iez`, `${r}aient`);
const futur = r => six(`${r}ai`, `${r}as`, `${r}a`, `${r}ons`, `${r}ez`, `${r}ont`);
const conditionnel = imparfait;
const psA = r => six(`${r}ai`, `${r}as`, `${r}a`, `${r}âmes`, `${r}âtes`, `${r}èrent`);
const psI = r => six(`${r}is`, `${r}is`, `${r}it`, `${r}îmes`, `${r}îtes`, `${r}irent`);
const psU = r => six(`${r}us`, `${r}us`, `${r}ut`, `${r}ûmes`, `${r}ûtes`, `${r}urent`);
// Subjonctif : radical des personnes "fortes" et radical de nous / vous.
const subj = (fort, faible) => six(`${fort}e`, `${fort}es`, `${fort}e`, `${faible}ions`, `${faible}iez`, `${fort}ent`);

function verbeE(inf, muet, stable) { // peser, lever, élever : e devient è devant une syllabe muette
  return {
    id: inf, inf, aux: 'avoir', pp: `${stable}é`, ppr: `${stable}ant`,
    present: six(`${muet}e`, `${muet}es`, `${muet}e`, `${stable}ons`, `${stable}ez`, `${muet}ent`),
    imparfait: imparfait(stable), passe_simple: psA(stable), futur: futur(`${muet}er`), conditionnel: conditionnel(`${muet}er`),
    subj_present: subj(muet, stable), imp: [`${muet}e`, `${stable}ons`, `${stable}ez`],
  };
}
function verbeVrir(inf, r, pp) { // couvrir, ouvrir, offrir, souffrir : présent comme un verbe en -er
  return {
    id: inf, inf, aux: 'avoir', pp, ppr: `${r}ant`,
    present: six(`${r}e`, `${r}es`, `${r}e`, `${r}ons`, `${r}ez`, `${r}ent`),
    imparfait: imparfait(r), passe_simple: psI(r), futur: futur(`${r}ir`), conditionnel: conditionnel(`${r}ir`),
    subj_present: subj(r, r), imp: [`${r}e`, `${r}ons`, `${r}ez`],
  };
}
function verbeCevoir(inf, pre) { // recevoir, apercevoir : ç devant o et u
  return {
    id: inf, inf, aux: 'avoir', pp: `${pre}çu`, ppr: `${pre}cevant`,
    present: six(`${pre}çois`, `${pre}çois`, `${pre}çoit`, `${pre}cevons`, `${pre}cevez`, `${pre}çoivent`),
    imparfait: imparfait(`${pre}cev`), passe_simple: psU(`${pre}ç`), futur: futur(`${pre}cevr`), conditionnel: conditionnel(`${pre}cevr`),
    subj_present: six(`${pre}çoive`, `${pre}çoives`, `${pre}çoive`, `${pre}cevions`, `${pre}ceviez`, `${pre}çoivent`),
    imp: [`${pre}çois`, `${pre}cevons`, `${pre}cevez`],
  };
}

export const VERBS = {
  dire: {
    id: 'dire', inf: 'dire', aux: 'avoir', pp: 'dit', ppr: 'disant',
    present: six('dis', 'dis', 'dit', 'disons', 'dites', 'disent'),
    imparfait: imparfait('dis'), passe_simple: psI('d'), futur: futur('dir'), conditionnel: conditionnel('dir'),
    subj_present: subj('dis', 'dis'), imp: ['dis', 'disons', 'dites'],
    note: "Attention : vous dites, avec -tes, au présent et à l'impératif (mais vous disiez, vous direz).",
  },
  pouvoir: {
    id: 'pouvoir', inf: 'pouvoir', aux: 'avoir', pp: 'pu', ppr: 'pouvant', invariable: true,
    present: six('peux|puis', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'),
    imparfait: imparfait('pouv'), passe_simple: psU('p'), futur: futur('pourr'), conditionnel: conditionnel('pourr'),
    subj_present: subj('puiss', 'puiss'), imp: null,
    note: "Deux r au futur et au conditionnel (je pourrai, je pourrais). Pas d'impératif. Le participe passé pu ne s'accorde jamais.",
  },
  aller: {
    id: 'aller', inf: 'aller', aux: 'être', pp: 'allé', ppr: 'allant',
    present: six('vais', 'vas', 'va', 'allons', 'allez', 'vont'),
    imparfait: imparfait('all'), passe_simple: psA('all'), futur: futur('ir'), conditionnel: conditionnel('ir'),
    subj_present: six('aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'), imp: ['va', 'allons', 'allez'],
    note: "Trois radicaux : v- (je vais), all- (nous allons), ir- (j'irai). Auxiliaire être : le participe passé s'accorde avec le sujet. À l'impératif : va, sans s.",
  },
  recevoir: {...verbeCevoir('recevoir', 're'), note: "Le c prend une cédille devant o et u (je reçois, j'ai reçu), mais pas devant e (nous recevons). Futur : je recevrai."},
  apercevoir: {...verbeCevoir('apercevoir', 'aper'), note: "Le c prend une cédille devant o et u (j'aperçois, j'ai aperçu), mais pas devant e (nous apercevons). Futur : j'apercevrai."},
  peser: {...verbeE('peser', 'pès', 'pes'), note: "Le e devient è devant une syllabe muette : je pèse, je pèserai, mais nous pesons."},
  lever: {...verbeE('lever', 'lèv', 'lev'), note: "Le e devient è devant une syllabe muette : je lève, je lèverai, mais nous levons."},
  elever: {...verbeE('élever', 'élèv', 'élev'), id: 'elever', note: "Le premier é ne bouge pas. Le second e devient è devant une syllabe muette : j'élève, j'élèverai, mais nous élevons."},
  couvrir: {...verbeVrir('couvrir', 'couvr', 'couvert'), note: "Au présent, il se conjugue comme un verbe en -er : je couvre, tu couvres. Participe passé : couvert."},
  ouvrir: {...verbeVrir('ouvrir', 'ouvr', 'ouvert'), note: "Au présent, il se conjugue comme un verbe en -er : j'ouvre, tu ouvres. Participe passé : ouvert."},
  offrir: {...verbeVrir('offrir', 'offr', 'offert'), note: "Au présent, il se conjugue comme un verbe en -er : j'offre, tu offres. Participe passé : offert."},
  souffrir: {...verbeVrir('souffrir', 'souffr', 'souffert'), note: "Au présent, il se conjugue comme un verbe en -er : je souffre, tu souffres. Participe passé : souffert."},
  boire: {
    id: 'boire', inf: 'boire', aux: 'avoir', pp: 'bu', ppr: 'buvant',
    present: six('bois', 'bois', 'boit', 'buvons', 'buvez', 'boivent'),
    imparfait: imparfait('buv'), passe_simple: psU('b'), futur: futur('boir'), conditionnel: conditionnel('boir'),
    subj_present: six('boive', 'boives', 'boive', 'buvions', 'buviez', 'boivent'), imp: ['bois', 'buvons', 'buvez'],
    note: "Deux radicaux : boi- (je bois, ils boivent) et buv- (nous buvons, je buvais). Participe passé : bu.",
  },
  lire: {
    id: 'lire', inf: 'lire', aux: 'avoir', pp: 'lu', ppr: 'lisant',
    present: six('lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'),
    imparfait: imparfait('lis'), passe_simple: psU('l'), futur: futur('lir'), conditionnel: conditionnel('lir'),
    subj_present: subj('lis', 'lis'), imp: ['lis', 'lisons', 'lisez'],
    note: "Radical lis- (nous lisons, je lisais), mais passé simple je lus et participe passé lu.",
  },
  assieger: {
    id: 'assieger', inf: 'assiéger', aux: 'avoir', pp: 'assiégé', ppr: 'assiégeant',
    present: six('assiège', 'assièges', 'assiège', 'assiégeons', 'assiégez', 'assiègent'),
    imparfait: six('assiégeais', 'assiégeais', 'assiégeait', 'assiégions', 'assiégiez', 'assiégeaient'),
    passe_simple: six('assiégeai', 'assiégeas', 'assiégea', 'assiégeâmes', 'assiégeâtes', 'assiégèrent'),
    futur: six('assiégerai|assiègerai', 'assiégeras|assiègeras', 'assiégera|assiègera', 'assiégerons|assiègerons', 'assiégerez|assiègerez', 'assiégeront|assiègeront'),
    conditionnel: six('assiégerais|assiègerais', 'assiégerais|assiègerais', 'assiégerait|assiègerait', 'assiégerions|assiègerions', 'assiégeriez|assiègeriez', 'assiégeraient|assiègeraient'),
    subj_present: six('assiège', 'assièges', 'assiège', 'assiégions', 'assiégiez', 'assiègent'),
    imp: ['assiège', 'assiégeons', 'assiégez'],
    note: "é devient è devant une syllabe muette (j'assiège). On garde un e après le g devant a et o (nous assiégeons, j'assiégeais). Futur : j'assiégerai, ou j'assiègerai en orthographe rectifiée.",
  },
  mouvoir: {
    id: 'mouvoir', inf: 'mouvoir', aux: 'avoir', pp: 'mû|mu', ppr: 'mouvant',
    present: six('meus', 'meus', 'meut', 'mouvons', 'mouvez', 'meuvent'),
    imparfait: imparfait('mouv'), passe_simple: psU('m'), futur: futur('mouvr'), conditionnel: conditionnel('mouvr'),
    subj_present: six('meuve', 'meuves', 'meuve', 'mouvions', 'mouviez', 'meuvent'), imp: ['meus', 'mouvons', 'mouvez'],
    note: "Radical meu- (je meus, ils meuvent) et mouv- (nous mouvons). Futur : je mouvrai. Participe passé : mû (ou mu en orthographe rectifiée), féminin mue.",
  },
};
export const VERB_LIST = Object.values(VERBS);

const AVOIR = {
  present: six('ai', 'as', 'a', 'avons', 'avez', 'ont'),
  imparfait: imparfait('av'),
  passe_simple: six('eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'),
  futur: futur('aur'), conditionnel: conditionnel('aur'),
  subj_present: six('aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'),
  subj_imparfait: six('eusse', 'eusses', 'eût', 'eussions', 'eussiez', 'eussent'),
  imp: ['aie', 'ayons', 'ayez'], ppr: 'ayant', pp: 'eu',
};
const ETRE = {
  present: six('suis', 'es', 'est', 'sommes', 'êtes', 'sont'),
  imparfait: imparfait('ét'),
  passe_simple: six('fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'),
  futur: futur('ser'), conditionnel: conditionnel('ser'),
  subj_present: six('sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'),
  subj_imparfait: six('fusse', 'fusses', 'fût', 'fussions', 'fussiez', 'fussent'),
  imp: ['sois', 'soyons', 'soyez'], ppr: 'étant', pp: 'été',
};

// kind : 'simple' (table du verbe), 'compose' (auxiliaire au temps `aux` + participe passé)
export const TENSES = [
  {id: 'present', mode: 'Indicatif', label: 'présent', kind: 'simple', table: 'present'},
  {id: 'imparfait', mode: 'Indicatif', label: 'imparfait', kind: 'simple', table: 'imparfait'},
  {id: 'passe_simple', mode: 'Indicatif', label: 'passé simple', kind: 'simple', table: 'passe_simple'},
  {id: 'futur', mode: 'Indicatif', label: 'futur simple', kind: 'simple', table: 'futur'},
  {id: 'passe_compose', mode: 'Indicatif', label: 'passé composé', kind: 'compose', aux: 'present', from: 'present'},
  {id: 'pqp', mode: 'Indicatif', label: 'plus-que-parfait', kind: 'compose', aux: 'imparfait', from: 'imparfait'},
  {id: 'passe_anterieur', mode: 'Indicatif', label: 'passé antérieur', kind: 'compose', aux: 'passe_simple', from: 'passe_simple'},
  {id: 'futur_anterieur', mode: 'Indicatif', label: 'futur antérieur', kind: 'compose', aux: 'futur', from: 'futur'},
  {id: 'subj_present', mode: 'Subjonctif', label: 'présent', kind: 'simple', table: 'subj_present'},
  {id: 'subj_passe', mode: 'Subjonctif', label: 'passé', kind: 'compose', aux: 'subj_present', from: 'subj_present'},
  {id: 'cond_present', mode: 'Conditionnel', label: 'présent', kind: 'simple', table: 'conditionnel'},
  {id: 'cond_passe', mode: 'Conditionnel', label: 'passé', kind: 'compose', aux: 'conditionnel', from: 'cond_present'},
  {id: 'cond_passe2', mode: 'Conditionnel', label: 'passé 2e forme', kind: 'compose', aux: 'subj_imparfait', optional: true},
  {id: 'imp_present', mode: 'Impératif', label: 'présent', kind: 'imp'},
  {id: 'imp_passe', mode: 'Impératif', label: 'passé', kind: 'imp_compose', from: 'imp_present'},
  {id: 'ger_present', mode: 'Gérondif', label: 'présent', kind: 'ger'},
  {id: 'ger_passe', mode: 'Gérondif', label: 'passé', kind: 'ger_compose', from: 'ger_present'},
  {id: 'part_present', mode: 'Participe', label: 'présent', kind: 'ppr'},
  {id: 'part_passe', mode: 'Participe', label: 'passé', kind: 'pp'},
];
export const TENSE = Object.fromEntries(TENSES.map(t => [t.id, t]));
export const MODES = [...new Set(TENSES.map(t => t.mode))];
export const shortTense = id => { const t = TENSE[id]; return t.mode === 'Indicatif' ? t.label : `${t.mode.toLowerCase()} ${t.label}`; };
const voyelle = id => /^[aeiouéèêh]/i.test(shortTense(id));
export const auTemps = id => (voyelle(id) ? `à l'${shortTense(id)}` : `au ${shortTense(id)}`);
export const leTemps = id => (voyelle(id) ? `l'${shortTense(id)}` : `le ${shortTense(id)}`);

export const COMPOSED_OF = Object.fromEntries(TENSES.filter(t => t.from).map(t => [t.from, t.id]));

export const PRONOUNS = {je: 0, tu: 1, il: 2, elle: 2, on: 2, nous: 3, vous: 4, ils: 5, elles: 5};
const IMP_INDEX = {tu: 0, nous: 1, vous: 2};
export const PERSON_LABEL = {
  je: '1re personne du singulier', tu: '2e personne du singulier', il: '3e personne du singulier', elle: '3e personne du singulier', on: '3e personne du singulier',
  nous: '1re personne du pluriel', vous: '2e personne du pluriel', ils: '3e personne du pluriel', elles: '3e personne du pluriel',
};
export const hasPerson = id => !['ger', 'ger_compose', 'ppr', 'pp'].includes(TENSE[id].kind);
export const isImperative = id => ['imp', 'imp_compose'].includes(TENSE[id].kind);
export const isValid = (v, t) => !(isImperative(t) && !VERBS[v].imp);

const alts = s => s.split('|');
const uniq = list => [...new Set(list)];

// Participe passé accordé. g : ms, fs, mp, fp.
export function agreePP(pp, g = 'ms') {
  if (g === 'ms') return pp;
  const base = pp === 'mû' ? 'mu' : pp;
  return base + {fs: 'e', mp: 's', fp: 'es'}[g];
}
export const ppForms = (verbId, g = 'ms') => {
  const v = VERBS[verbId];
  return uniq(alts(v.pp).map(p => v.invariable ? p : agreePP(p, g)));
};

// Genres possibles pour un sujet donné (seul "aller" est concerné, auxiliaire être).
function gendersOf(pronoun) {
  switch (pronoun) {
    case 'il': return ['ms'];
    case 'elle': return ['fs'];
    case 'ils': return ['mp'];
    case 'elles': return ['fp'];
    case 'je': case 'tu': return ['ms', 'fs'];
    case 'nous': return ['mp', 'fp'];
    case 'on': case 'vous': return ['ms', 'fs', 'mp', 'fp'];
    default: return ['ms', 'fs', 'mp', 'fp'];
  }
}

const auxOf = v => (v.aux === 'être' ? ETRE : AVOIR);
function compoundWith(auxForm, verbId, pronoun, g) {
  const v = VERBS[verbId];
  if (v.aux !== 'être') return ppForms(verbId).map(p => `${auxForm} ${p}`);
  const gs = g ? [g] : gendersOf(pronoun);
  return uniq(gs.flatMap(x => ppForms(verbId, x).map(p => `${auxForm} ${p}`)));
}

// Toutes les orthographes acceptées, sans pronom. La première est la forme de référence.
export function forms(verbId, tenseId, pronoun = 'il', g) {
  const v = VERBS[verbId], t = TENSE[tenseId];
  const idx = PRONOUNS[pronoun];
  switch (t.kind) {
    case 'simple': return alts(v[t.table][idx]);
    case 'compose': return compoundWith(auxOf(v)[t.aux][idx], verbId, pronoun, g);
    case 'imp': return v.imp ? [v.imp[IMP_INDEX[pronoun]]] : [];
    case 'imp_compose': return v.imp ? compoundWith(auxOf(v).imp[IMP_INDEX[pronoun]], verbId, pronoun, g) : [];
    case 'ger': return [`en ${v.ppr}`];
    case 'ger_compose': return compoundWith(`en ${auxOf(v).ppr}`, verbId, 'x', g);
    case 'ppr': return [v.ppr];
    case 'pp': return ppForms(verbId, g || 'ms');
    default: return [];
  }
}

// Forme passive : être conjugué au temps voulu + participe passé accordé.
export function passiveForm(verbId, tenseId, pronoun, g) {
  const t = TENSE[tenseId], idx = PRONOUNS[pronoun];
  const pps = ppForms(verbId, g);
  if (t.kind === 'simple') return pps.map(p => `${ETRE[t.table][idx]} ${p}`);
  if (t.kind === 'compose') return pps.map(p => `${AVOIR[t.aux][idx]} été ${p}`);
  throw new Error(`passif non prévu : ${tenseId}`);
}

const startsVowel = s => /^[aàâeéèêiîoôuûhy]/i.test(s);
export function withPronoun(form, pronoun, tenseId) {
  const t = TENSE[tenseId];
  if (!hasPerson(tenseId) || isImperative(tenseId)) return form;
  const pr = pronoun === 'je' && startsVowel(form) ? `j'${form}` : `${pronoun} ${form}`;
  if (t.mode !== 'Subjonctif') return pr;
  return /^(il|elle|on|ils|elles)$/.test(pronoun) ? `qu'${pr}` : `que ${pr}`;
}

// Formes acceptées quand on saisit éventuellement le pronom (et "que" au subjonctif).
export function acceptedConj(verbId, tenseId, pronoun) {
  const base = forms(verbId, tenseId, pronoun);
  if (!hasPerson(tenseId) || isImperative(tenseId)) return base;
  const out = [...base];
  for (const f of base) {
    const full = withPronoun(f, pronoun, tenseId);
    out.push(full);
    if (TENSE[tenseId].mode === 'Subjonctif') out.push(full.replace(/^que /, '').replace(/^qu'/, ''));
  }
  return uniq(out);
}

// Forme de référence, à afficher dans le corrigé ("je serai allé(e)").
const ALLE = {je: 'allé(e)', tu: 'allé(e)', il: 'allé', elle: 'allée', on: 'allé', nous: 'allé(e)s', vous: 'allé(e)(s)', ils: 'allés', elles: 'allées'};
export function displayForm(verbId, tenseId, pronoun, g) {
  let f = forms(verbId, tenseId, pronoun, g)[0];
  if (!f) return '';
  const kind = TENSE[tenseId].kind;
  if (!g && VERBS[verbId].aux === 'être' && ['compose', 'imp_compose', 'ger_compose'].includes(kind)) {
    f = f.replace(/allé\w*$/, kind === 'ger_compose' ? 'allé(e)(s)' : ALLE[pronoun]);
  }
  return withPronoun(f, pronoun, tenseId);
}

// Pour le diagnostic : toutes les formes du verbe, avec le temps et la personne.
export function allFormsOf(verbId) {
  const out = [];
  for (const t of TENSES) {
    if (!isValid(verbId, t.id)) continue;
    const prs = hasPerson(t.id) ? (isImperative(t.id) ? ['tu', 'nous', 'vous'] : ['je', 'tu', 'il', 'nous', 'vous', 'ils']) : ['il'];
    for (const pr of prs) for (const f of forms(verbId, t.id, pr)) out.push({form: f, t: t.id, pr, personal: hasPerson(t.id)});
  }
  return out;
}

export const FORMATION = {
  passe_compose: "auxiliaire au présent + participe passé",
  pqp: "auxiliaire à l'imparfait + participe passé",
  passe_anterieur: "auxiliaire au passé simple + participe passé",
  futur_anterieur: "auxiliaire au futur simple + participe passé",
  subj_passe: "auxiliaire au subjonctif présent + participe passé",
  cond_passe: "auxiliaire au conditionnel présent + participe passé",
  cond_passe2: "auxiliaire au subjonctif imparfait + participe passé (j'eusse dit)",
  imp_passe: "auxiliaire à l'impératif présent + participe passé (aie dit, ayons dit, ayez dit)",
  ger_passe: "en + ayant ou étant + participe passé",
  ger_present: "en + participe présent",
  part_present: "radical de nous au présent + -ant",
  part_passe: "dit, pu, allé, reçu... : il faut le connaître",
  imp_present: "trois personnes seulement (tu, nous, vous), sans pronom",
  present: "le temps de base : regarde bien le radical du verbe",
  imparfait: "radical de nous au présent + -ais, -ais, -ait, -ions, -iez, -aient",
  passe_simple: "-ai, -as, -a, -âmes, -âtes, -èrent ou -is, -it, -îmes ou -us, -ut, -ûmes",
  futur: "radical du futur + -ai, -as, -a, -ons, -ez, -ont",
  cond_present: "radical du futur + terminaisons de l'imparfait",
  subj_present: "-e, -es, -e, -ions, -iez, -ent",
};
