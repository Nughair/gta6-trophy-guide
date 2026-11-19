// data.js — loads the trophy data file that ships inside app/ (relative fetch, no network).
// Exports the trophy list plus a small summary of the list's makeup for the header chips.

export async function loadData() {
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('Could not load data/trophies.json');
  const doc = await res.json();
  const trophies = doc.trophies;
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const byKind = {};
  let missables = 0;
  for (const t of trophies) {
    byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
    byKind[t.kind] = (byKind[t.kind] || 0) + 1;
    if (t.missable) missables += 1;
  }
  return { game: doc.game, platform: doc.platform, trophies, byGrade, byKind, missables, total: trophies.length };
}

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side stories',
  collectibles: 'Collectibles',
  activities: 'Activities',
  world: 'World',
  completion: 'Completion',
  missable: 'Missable',
};

export const KIND_ORDER = ['story', 'side', 'collectibles', 'activities', 'world', 'completion'];
