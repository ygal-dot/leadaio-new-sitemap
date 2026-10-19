// LeadAIO: the AI answer map. Everything here enhances a page that reads fine without it.

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};

// ---------- the market map ----------
(() => {
  const svg = document.getElementById('plot');
  if (!svg) return;
  // plot area in viewBox units; data runs 0 to 100 on both axes
  const X0 = 60, X1 = 980, Y0 = 570, Y1 = 20;
  const px = (x) => X0 + (x / 100) * (X1 - X0);
  const py = (y) => Y0 - (y / 100) * (Y0 - Y1);

  // grid
  const grid = document.getElementById('plot-grid');
  for (let i = 10; i < 100; i += 10) {
    el('line', { x1: px(i), y1: Y1, x2: px(i), y2: Y0, class: i === 50 ? 'mid' : '' }, grid);
    el('line', { x1: X0, y1: py(i), x2: X1, y2: py(i), class: i === 50 ? 'mid' : '' }, grid);
  }
  for (const t of [0, 50, 100]) {
    el('text', { x: px(t), y: Y0 + 18, 'text-anchor': t === 0 ? 'start' : t === 100 ? 'end' : 'middle' }, grid).textContent = t;
    if (t) el('text', { x: X0 - 8, y: py(t) + 4, 'text-anchor': 'end' }, grid).textContent = t;
  }

  // sample rivals (fictional)
  const RIVALS = [
    ['Helix', 78, 74], ['Payroo', 64, 86], ['Stackwise', 86, 60], ['Finch HR', 54, 66],
    ['Orbitly', 34, 72], ['Vantage', 72, 40], ['Cobalt Pay', 26, 38], ['Meridian', 46, 22],
  ];
  const rivals = document.getElementById('rivals');
  for (const [name, x, y] of RIVALS) {
    const g = el('g', { class: 'rival' }, rivals);
    el('circle', { cx: px(x), cy: py(y), r: 7 }, g);
    el('text', { x: px(x) + 13, y: py(y) + 4.5 }, g).textContent = name;
  }

  // placements: how far each one moves the dot (cited, named)
  const MOVES = { reddit: [22, 18], reviews: [14, 12], lists: [18, 20], pubs: [10, 8], suggest: [4, 10] };
  const BASE = [10, 12];
  const on = [];

  const you = document.getElementById('you');
  const trail = document.getElementById('trail');
  const crossX = document.getElementById('cross-x');
  const crossY = document.getElementById('cross-y');
  const label = document.getElementById('you-label');
  const out = {
    named: document.getElementById('ro-named'), chatgpt: document.getElementById('ro-chatgpt'),
    perplexity: document.getElementById('ro-perplexity'), gemini: document.getElementById('ro-gemini'),
    aio: document.getElementById('ro-aio'),
  };

  const counters = new Map();
  const countTo = (node, to) => {
    const from = Number(node.textContent) || 0;
    if (counters.has(node)) cancelAnimationFrame(counters.get(node));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = to; return; }
    const t0 = performance.now(), dur = 700;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      node.textContent = Math.round(from + (to - from) * e);
      if (k < 1) counters.set(node, requestAnimationFrame(step));
    };
    counters.set(node, requestAnimationFrame(step));
  };

  function render() {
    const pts = [BASE.slice()];
    for (const key of on) {
      const [dx, dy] = MOVES[key];
      const [x, y] = pts[pts.length - 1];
      pts.push([Math.min(94, x + dx), Math.min(94, y + dy)]);
    }
    const [x, y] = pts[pts.length - 1];
    you.style.transform = `translate(${px(x)}px, ${py(y)}px)`;
    trail.setAttribute('d', pts.length > 1 ? 'M' + pts.map(([a, b]) => `${px(a)},${py(b)}`).join(' L') : '');
    crossX.setAttribute('x1', px(x)); crossX.setAttribute('x2', px(x));
    crossY.setAttribute('y1', py(y)); crossY.setAttribute('y2', py(y));
    const s = (x + y) / 2;
    label.textContent = `Your brand · ${Math.round(s)}`;
    // size the tag to its text, and flip it left near the right edge
    const rect = you.querySelector('.you-tag rect');
    const w = label.getComputedTextLength() + 24;
    const left = x > 72;
    rect.setAttribute('width', w);
    rect.setAttribute('x', left ? -20 - w : 20);
    label.setAttribute('x', left ? -8 - w : 32);
    // high on the map the tag sits below the dot, clear of the rivals' labels
    const below = y > 72;
    rect.style.transform = label.style.transform = below ? 'translateY(52px)' : '';
    countTo(out.named, Math.round((s / 100) * 40 * 0.5));
    countTo(out.chatgpt, Math.round(s * 0.48));
    countTo(out.perplexity, Math.round(s * 0.55));
    countTo(out.gemini, Math.round(s * 0.36));
    countTo(out.aio, Math.round(s * 0.42));
  }

  document.querySelectorAll('.sw[data-src]').forEach((b) => b.addEventListener('click', () => {
    const key = b.dataset.src;
    const i = on.indexOf(key);
    if (i === -1) on.push(key); else on.splice(i, 1);
    b.setAttribute('aria-pressed', String(i === -1));
    render();
  }));

  render();
})();

// ---------- share of voice chart (example account) ----------
(() => {
  const svg = document.getElementById('sov');
  if (!svg) return;
  const W0 = 36, W1 = 540, H0 = 230, H1 = 16, MAX = 50;
  const x = (i) => W0 + (i / 11) * (W1 - W0);
  const y = (v) => H0 - (v / MAX) * (H0 - H1);
  const SERIES = [
    ['Perplexity', '#d4af37', [4, 5, 7, 10, 14, 19, 25, 30, 36, 40, 44, 47]],
    ['ChatGPT', '#ece8dc', [2, 2, 3, 5, 8, 12, 17, 23, 29, 34, 39, 42]],
    ['AI Overviews', '#a8935a', [3, 3, 4, 6, 8, 11, 15, 19, 24, 28, 31, 34]],
    ['Gemini', '#7d796f', [2, 2, 2, 3, 5, 7, 10, 13, 17, 21, 25, 29]],
  ];
  const grid = el('g', { class: 'sov-grid' }, svg);
  const ax = el('g', { class: 'sov-ax' }, svg);
  for (const v of [0, 25, 50]) {
    el('line', { x1: W0, x2: W1, y1: y(v), y2: y(v) }, grid);
    el('text', { x: W0 - 8, y: y(v) + 4, 'text-anchor': 'end' }, ax).textContent = v + '%';
  }
  el('text', { x: W0, y: H0 + 20 }, ax).textContent = 'Week 1';
  el('text', { x: W1, y: H0 + 20, 'text-anchor': 'end' }, ax).textContent = 'Week 12';
  const labelYs = [];
  for (const [name, color, data] of SERIES) {
    el('polyline', { class: 'sov-line', stroke: color, pathLength: 1, points: data.map((v, i) => `${x(i)},${y(v)}`).join(' ') }, svg);
    el('circle', { cx: x(11), cy: y(data[11]), r: 3.5, fill: color }, svg);
    let ly = y(data[11]) + 4;
    for (const prev of labelYs) if (Math.abs(prev - ly) < 14) ly = prev + 14;
    labelYs.push(ly);
    el('text', { class: 'sov-lab', x: W1 + 10, y: ly, fill: color }, svg).textContent = `${name} ${data[11]}%`;
  }
})();

// ---------- reveal once on entering the viewport ----------
(() => {
  const targets = document.querySelectorAll('.bars, .dash');
  if (!('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.25 });
  targets.forEach((t) => io.observe(t));
  window.addEventListener('load', () => setTimeout(() => targets.forEach((t) => {
    const r = t.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) t.classList.add('is-in');
  }), 2000));
})();

// ---------- live chat ----------
// Wire your chat widget by defining window.LeadAIOChat.open(). Until then the link opens an email.
document.querySelectorAll('[data-chat]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  if (window.LeadAIOChat && typeof window.LeadAIOChat.open === 'function') window.LeadAIOChat.open();
  else window.location.href = 'mailto:success@leadaio.com?subject=Live%20chat%20request';
}));
