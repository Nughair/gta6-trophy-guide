// app.js — rendering and wiring for the Leonida Platinum Companion.
// Views: Checklist (list + detail), Roadmap, Missables, Save & sources.
// ?shot=1..4 seeds a fixed demo state for screenshots; normal use never seeds.

import { loadData, KIND_LABELS, KIND_ORDER } from './data.js';
import { loadState, saveState, exportState, importState, emptyState } from './store.js';

const ROADMAP = [
  { title: 'Opening', ids: [2, 44], tip: 'Learn the controls, then take the Ocean Beach moment slowly — one missable lives here.' },
  { title: 'Chapters 1–2', ids: [3, 4, 8], tip: 'Story only. Let the map open at its own pace and bank every mission gold you can.' },
  { title: 'Chapter 3 + first heists', ids: [5, 9, 10, 11], tip: 'The first big scores land here; keep a clean save before each heist kicks off.' },
  { title: 'Chapter 4', ids: [6, 12, 13], tip: 'The net tightens. Finish chapter business before pushing the finale.' },
  { title: 'Finale', ids: [7], tip: 'See the story out. Everything unflagged can still be cleaned up afterwards.' },
  { title: 'Side stories', ids: [22, 23, 24, 26, 27, 25], tip: 'Work each contact\u2019s strand to its final mission; the strands trophy counts eight of them.' },
  { title: 'Leonida pastimes', ids: [16, 15, 17, 18, 19, 20, 21, 28, 29, 32, 46], tip: 'Sample every activity once, then grind the counters: stunts, range golds, races and challenges.' },
  { title: 'Collections & the map', ids: [30, 31, 35, 42, 55], tip: 'Cards, WAiNK spots, vehicles and full exploration — best done district by district.' },
  { title: 'Scores & the street', ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 45, 47, 48, 49, 50, 51], tip: 'Robberies, escapes and one-off feats. Several flagged missables hide in this stage — check the pins first.' },
  { title: 'The money', ids: [52, 53, 54], tip: 'Launder the marked bills, spend across the shops and buy every garage property.' },
  { title: '100% and the platinum', ids: [14, 1], tip: 'Close out the completion checklist and the platinum pops with the last trophy.' },
];

const MISS_WINDOWS = {
  33: 'Window: while partnered up in free roam / co-op story beats — do it as soon as you can ride together.',
  34: 'Window: same partnership sessions as Hot Together — chain the three robberies in one outing.',
  37: 'Window: a visit to VCIA (the airport) — read as tied to a story departure; try it on your first airport trip.',
  44: 'Window: the opening stretch on Ocean Beach — take the cocktail moment before the story moves you on.',
  45: 'Window: read as a set-piece showroom moment — attempt it the first time a showroom features in play.',
  47: 'Window: a partnership beat — read as tied to a specific joint moment; do not leave it for the endgame.',
  49: 'Window: read as a second-chance story beat — if the first attempt passes, mission replay is the recovery.',
};

const params = new URLSearchParams(location.search);
const shot = params.get('shot');

let state = loadState();
if (shot) {
  state = {
    earned: [2, 3, 8, 16, 18, 21, 28, 35, 42, 44, 46, 51, 53],
    counters: { 15: 137, 17: 19, 32: 23, 35: 46, 42: 21 },
    spoiler: shot === '4',
  };
}

const data = await loadData();
const byId = new Map(data.trophies.map((t) => [t.id, t]));
let kindFilter = 'all';
let selectedId = shot === '2' ? 37 : null;
let view = shot === '3' ? 'roadmap' : 'checklist';

const $ = (id) => document.getElementById(id);
const earnedSet = () => new Set(state.earned);
const isEarned = (t) => earnedSet().has(t.id);
const counterOf = (t) => state.counters[t.id] || 0;
const masked = (t) => state.spoiler && t.kind === 'story' && !isEarned(t);
const shownName = (t) => (masked(t) ? '•••• •••• ••••••' : t.name);
const shownDesc = (t) => (masked(t) ? 'Hidden by the spoiler shield until earned.' : t.description);

function persist() { if (!shot) saveState(state); }

function setEarned(t, on) {
  const s = earnedSet();
  if (on) s.add(t.id); else s.delete(t.id);
  state.earned = [...s];
  persist();
}

function setCounter(t, v) {
  state.counters[t.id] = Math.max(0, Math.min(t.target ?? v, v));
  if (t.target && state.counters[t.id] >= t.target) setEarned(t, true);
  persist();
}

function header() {
  const n = state.earned.length;
  $('earnedCount').textContent = n;
  $('pctLabel').textContent = `${Math.round((n / data.total) * 100)}% to platinum`;
  $('scoreBarFill').style.width = `${(n / data.total) * 100}%`;
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const id of state.earned) { const t = byId.get(id); if (t) counts[t.grade] += 1; }
  $('gradeChips').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `<span class="gchip"><span class="dot ${g}"></span>${g} ${counts[g]}/${data.byGrade[g]}</span>`).join('');
}

function kindBar() {
  const chips = [['all', 'All', data.total]];
  for (const k of KIND_ORDER) chips.push([k, KIND_LABELS[k], data.byKind[k] || 0]);
  chips.push(['missable', 'Missable', data.missables]);
  $('kindBar').innerHTML = chips.map(([k, label, n]) =>
    `<button type="button" class="kchip ${kindFilter === k ? 'active' : ''}" data-kind="${k}">${label} <span class="n">${n}</span></button>`).join('');
  $('kindBar').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { kindFilter = b.dataset.kind; render(); }));
}

function filtered() {
  const q = $('search').value.trim().toLowerCase();
  const grade = $('gradeFilter').value;
  const ef = $('earnedFilter').value;
  return data.trophies.filter((t) => {
    if (kindFilter === 'missable' && !t.missable) return false;
    if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (ef === 'earned' && !isEarned(t)) return false;
    if (ef === 'open' && isEarned(t)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.kind} ${t.grade}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function counterHTML(t) {
  if (!t.target) return '';
  return `<span class="counter" data-counter="${t.id}">
    <button type="button" data-d="-1" aria-label="Decrease">−</button>
    <span class="cval">${counterOf(t)} / ${t.target.toLocaleString()}</span>
    <button type="button" data-d="1" aria-label="Increase">+</button></span>`;
}

function renderList() {
  const list = filtered();
  $('listCount').textContent = `${list.length} of ${data.total} trophies shown`;
  $('rows').innerHTML = list.map((t) => `
    <li class="row ${isEarned(t) ? 'earned' : ''} ${selectedId === t.id ? 'selected' : ''}" data-id="${t.id}">
      <input type="checkbox" data-check="${t.id}" ${isEarned(t) ? 'checked' : ''} aria-label="Mark ${t.name} earned">
      <span class="dot ${t.grade}" title="${t.grade}"></span>
      <div class="rowmain">
        <div class="tname ${masked(t) ? 'masked' : ''}">${shownName(t)}</div>
        <div class="tdesc">${shownDesc(t)}</div>
        <div class="tags"><span class="tag grade">${t.grade}</span><span class="tag">${KIND_LABELS[t.kind]}</span>${t.missable ? '<span class="tag miss">MISSABLE</span>' : ''}</div>
      </div>
      ${counterHTML(t)}
    </li>`).join('') || '<li class="row">No trophies match those filters.</li>';
  $('rows').querySelectorAll('.row[data-id]').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('[data-check]') || e.target.closest('[data-counter]')) return;
      selectedId = Number(row.dataset.id);
      render();
    });
  });
  $('rows').querySelectorAll('[data-check]').forEach((box) => box.addEventListener('change', () => {
    const t = byId.get(Number(box.dataset.check));
    setEarned(t, box.checked);
    render();
  }));
  $('rows').querySelectorAll('[data-counter]').forEach((c) => c.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      const t = byId.get(Number(c.dataset.counter));
      setCounter(t, counterOf(t) + Number(b.dataset.d) * (t.target >= 1000 ? 1000 : 1));
      render();
    })));
}

function renderDetail() {
  const pane = $('detailPane');
  const t = selectedId ? byId.get(selectedId) : null;
  if (!t) { pane.innerHTML = '<p class="empty">Pick a trophy on the left and its full guide, step list, missable note and sources appear here.</p>'; return; }
  const pct = t.target ? Math.round((counterOf(t) / t.target) * 100) : 0;
  pane.innerHTML = `
    <div class="dhead"><span class="dot ${t.grade}"></span><h2>${shownName(t)}</h2></div>
    <p class="ddesc">&ldquo;${shownDesc(t)}&rdquo;</p>
    <div class="tags"><span class="tag grade">${t.grade}</span><span class="tag">${KIND_LABELS[t.kind]}</span>${t.missable ? '<span class="tag miss">MISSABLE</span>' : ''}<span class="tag">${isEarned(t) ? 'Earned' : 'Not earned'}</span></div>
    ${t.missable ? `<div class="missnote"><b>Missable — handle with care.</b> ${MISS_WINDOWS[t.id] || ''} The chance is tied to a story moment; if it passes, mission replay is the recovery.</div>` : ''}
    ${t.target ? `<div class="dcounter"><span>Progress</span><button type="button" data-dd="-1" aria-label="Decrease counter">−</button><div class="progressline"><i style="width:${pct}%"></i></div><b>${counterOf(t)} / ${t.target.toLocaleString()}</b><button type="button" data-dd="1" aria-label="Increase counter">+</button><span style="color:#5a6b76">${t.target - counterOf(t) > 0 ? `${(t.target - counterOf(t)).toLocaleString()} to go` : 'Target reached'}</span></div>` : ''}
    <h3>Guide</h3>
    <p class="dguide">${t.guide}</p>
    <h3>Steps</h3>
    <ol>${t.steps.map((s) => `<li>${s}</li>`).join('')}</ol>
    <div class="sources"><h3>Sources</h3><ul>${t.sources.map((s) => `<li>${s}</li>`).join('')}</ul></div>`;
  pane.querySelectorAll('[data-dd]').forEach((b) => b.addEventListener('click', () => {
    setCounter(t, counterOf(t) + Number(b.dataset.dd) * (t.target >= 1000 ? 1000 : 1));
    render();
  }));
}

function stageItems(ids, warn) {
  return ids.map((id) => { const t = byId.get(id); if (!t) return ''; return `<span class="sitem ${isEarned(t) ? 'done' : ''} ${warn && t.missable ? 'warn' : ''}" data-jump="${id}">${t.name}</span>`; }).join('');
}

function renderRoadmap() {
  const miss = data.trophies.filter((t) => t.missable);
  $('missablePin').innerHTML = `<div class="pinbox"><h3>&#9888; Missables first — pinned so they cannot slip past</h3><div class="stageitems">${stageItems(miss.map((t) => t.id), true)}</div>
    <p style="margin:6px 0 0">Each of these is a risk read from its official description: the chance is tied to a story moment, and if it passes, mission replay is the recovery. Open the Missables tab for the window on each one.</p></div>`;
  $('roadmap').innerHTML = ROADMAP.map((s, i) => `
    <div class="stage"><h3><span class="stageno">Stage ${i + 1}.</span> ${s.title} <span style="color:#5a6b76;font-weight:400">— ${s.ids.filter((id) => isEarned(byId.get(id))).length}/${s.ids.length} done</span></h3>
    <p style="margin:0 0 6px;color:#46565f">${s.tip}</p><div class="stagebar"><i style="width:${s.ids.length ? (s.ids.filter((id) => isEarned(byId.get(id))).length / s.ids.length) * 100 : 0}%"></i></div><div class="stageitems">${stageItems(s.ids, true)}</div></div>`).join('');
  bindJumps();
}

function renderMissables() {
  $('missableList').innerHTML = data.trophies.filter((t) => t.missable).map((t) => `
    <div class="misscard"><h3><span class="dot ${t.grade}"></span> ${t.name} <span class="tag miss">MISSABLE</span></h3>
    <p class="ddesc" style="margin:0">&ldquo;${t.description}&rdquo;</p>
    <p class="window">${MISS_WINDOWS[t.id] || ''}</p>
    <p>${t.guide}</p>
    <p style="color:#46565f">Recovery if it passes: mission replay. Sources: ${t.sources.join(' · ')}</p></div>`).join('');
}

function bindJumps() {
  document.querySelectorAll('[data-jump]').forEach((el) => el.addEventListener('click', () => {
    selectedId = Number(el.dataset.jump);
    switchView('checklist');
    render();
  }));
}

function switchView(v) {
  view = v;
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
  document.querySelectorAll('.view').forEach((s) => s.classList.toggle('active', s.id === `view-${v}`));
}

function render() {
  header(); kindBar(); renderList(); renderDetail(); renderRoadmap(); renderMissables();
  $('spoilerToggle').checked = state.spoiler;
}

$('tabs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { switchView(b.dataset.view); render(); }));
['search', 'gradeFilter', 'earnedFilter'].forEach((id) => { $(id).addEventListener('input', render); $(id).addEventListener('change', render); });
$('spoilerToggle').addEventListener('change', () => { state.spoiler = $('spoilerToggle').checked; persist(); render(); });

$('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([exportState(state)], { type: 'application/json' }));
  a.download = 'leonida-companion-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  $('saveMsg').textContent = 'Progress exported.';
});
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try { state = importState(await file.text()); persist(); render(); $('saveMsg').textContent = 'Progress imported.'; }
  catch { $('saveMsg').textContent = 'That file could not be imported.'; }
});
$('resetBtn').addEventListener('click', () => { state = emptyState(); persist(); selectedId = null; render(); $('saveMsg').textContent = 'All progress reset.'; });

switchView(view);
render();
