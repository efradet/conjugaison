export const TYPES = {
  conj: {
    cls: 'c1', num: 1, title: '20 questions de conjugaison', sub: 'Un verbe, une personne, un temps : tout change à chaque série.',
    intro: "Écris la forme demandée. Le pronom est facultatif : « lirons » et « nous lirons » sont acceptés. À l'impératif, pas de pronom. Au gérondif, n'oublie pas en.",
  },
  gap: {
    cls: 'c2', num: 2, title: 'Phrases à trous', sub: 'Concordance des temps : à toi de trouver le bon temps.',
    intro: "Le temps n'est pas donné : c'est le reste de la phrase qui te l'indique. Écris seulement le verbe conjugué, sans le sujet.",
  },
  voice: {
    cls: 'c3', num: 3, title: 'Actif et passif', sub: 'Retourne la phrase, en gardant le même temps.',
    intro: "Réécris toute la phrase à l'autre voix. Le temps ne change pas. L'objet devient sujet, le sujet devient complément d'agent (par...). Les verbes aller, pouvoir et souffrir ne se mettent pas au passif : ils ne sont pas dans cet exercice.",
  },
  compose: {
    cls: 'c4', num: 4, title: 'Du temps simple au temps composé', sub: 'À l\'actif et au passif.',
    intro: "Modifie la phrase pour mettre le verbe au temps composé correspondant : présent → passé composé, imparfait → plus-que-parfait, futur → futur antérieur...",
  },
  test: {
    cls: 'master', title: 'Test mélangé', sub: 'Les quatre exercices ensemble, sans indice, avec une note à la fin.',
    intro: "8 formes à conjuguer, 5 phrases à trous, 4 phrases actif ou passif et 3 phrases au temps composé, dans le désordre. Pas d'indice : comme un vrai test.",
  },
  review: {
    cls: 'c5', title: 'Mes points faibles', sub: 'Les verbes et les temps où tu as fait des erreurs.',
    intro: "Chaque bonne réponse retire un point faible de la liste, chaque erreur en ajoute un.",
  },
};

// Apostrophes et espaces insécables de la typographie française, à l'affichage seulement.
export const typo = s => (s || '').replace(/'/g, '’').replace(/ ([!?:;])/g, ' $1');
