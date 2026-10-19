// LeadAIO: mission control. Everything here enhances a page that reads fine without it.

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- the flight path ----------
(() => {
  const svg = document.getElementById('flight');
  if (!svg) return;
  const area = svg.parentElement;
  // waypoints in % of the console: Unknown, Reddit threads, Review sites, Best-of lists, Named first
  const PTS = [[4, 84], [39, 65], [57, 50], [70, 38], [86, 25]];
  // telemetry at each stage (example data): named of 40, ChatGPT, Perplexity, Gemini, AI Overviews
  const TM = [[3, 6, 7, 5, 5], [7, 17, 21, 12, 14], [11, 28, 33, 19, 23], [14, 36, 41, 25, 30], [16, 42, 47, 29, 34]];
  const ids = ['t-named', 't-chatgpt', 't-perplexity', 't-gemini', 't-aio'].map((i) => document.getElementById(i));

  const grid = document.getElementById('flight-grid');
  for (let i = 1; i < 10; i++) {
    el('line', { x1: i * 100, y1: 0, x2: i * 100, y2: 940 }, grid);
    el('line', { x1: 0, y1: i * 100, x2: 1000, y2: i * 100 }, grid);
  }
  const ticks = document.getElementById('flight-ticks');
  for (const [x] of PTS.slice(1)) el('line', { x1: x * 10, y1: 932, x2: x * 10, y2: 948 }, ticks);

  // smooth path through the waypoints (Catmull-Rom to Bezier), in viewBox units (0-1000)
  const P = PTS.map(([x, y]) => [x * 10, y * 10]);
  let d = `M${P[0][0]},${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  const ghost = document.getElementById('flight-ghost');
  const live = document.getElementById('flight-path');
  ghost.setAttribute('d', d);
  // the live path is redrawn up to the marker each frame; the full path is only measured
  const meas = el('path', { d }, null);
  svg.appendChild(meas); meas.style.display = 'none';
  const L = meas.getTotalLength();
  const SAMPLES = Array.from({ length: 401 }, (_, i) => { const q = meas.getPointAtLength((L * i) / 400); return [q.x, q.y]; });

  // where each waypoint sits along the path
  const stageAt = P.map(([x, y]) => {
    let best = 0, bestD = Infinity;
    for (let s = 0; s <= L; s += L / 600) {
      const q = meas.getPointAtLength(s), dd = (q.x - x) ** 2 + (q.y - y) ** 2;
      if (dd < bestD) { bestD = dd; best = s; }
    }
    return best;
  });
  stageAt[stageAt.length - 1] = L;

  const wps = [...document.querySelectorAll('.wp')];
  wps.forEach((w, i) => { w.style.setProperty('--x', PTS[i][0] + '%'); w.style.setProperty('--y', PTS[i][1] + '%'); });
  const marker = document.getElementById('marker');
  const orbit = document.getElementById('orbit');

  let pos = 0, raf = 0;
  function paint(s) {
    pos = s;
    const q = meas.getPointAtLength(s);
    const n = Math.floor((s / L) * 400);
    live.setAttribute('d', 'M' + SAMPLES.slice(0, n + 1).map((p) => p.join(',')).join(' L') + ` L${q.x},${q.y}`);
    marker.style.setProperty('--mx', q.x / 10 + '%');
    marker.style.setProperty('--my', q.y / 10 + '%');
    // telemetry interpolates between stages
    let k = 0; while (k < stageAt.length - 2 && s > stageAt[k + 1]) k++;
    const t = Math.min(1, Math.max(0, (s - stageAt[k]) / (stageAt[k + 1] - stageAt[k] || 1)));
    ids.forEach((n, j) => { n.textContent = Math.round(TM[k][j] + (TM[k + 1][j] - TM[k][j]) * t); });
    wps.forEach((w, i) => w.classList.toggle('is-lit', s >= stageAt[i] - 1));
    orbit.style.setProperty('--orbit-o', s >= L - 1 ? '1' : '0.25');
  }
  function flyTo(stage, dur) {
    cancelAnimationFrame(raf);
    wps.forEach((w, i) => w.querySelector('button').setAttribute('aria-pressed', String(i === stage)));
    const from = pos, to = stageAt[stage];
    if (reduced() || !dur) { paint(to); return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // ease in-out cubic: a launch, then a settle
      paint(from + (to - from) * e);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  wps.forEach((w, i) => w.querySelector('button').addEventListener('click', () => flyTo(i, 1100)));
  document.getElementById('replay').addEventListener('click', () => { paint(0); flyTo(4, 3200); });

  // first paint shows the finished state; the launch then plays from Unknown once the hero is in view
  paint(L);
  if (!reduced()) {
    paint(0);
    const go = () => setTimeout(() => flyTo(4, 3200), 350);
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
  }
  area.dataset.ready = '1';
})();

// ---------- answer feed: one answer per engine (sample, placeholder brand) ----------
(() => {
  const box = document.getElementById('feed-answer');
  if (!box) return;
  const ANSWERS = [
    'For startups, <mark>Your brand</mark> is the payroll software people recommend most. It combines payroll, benefits and HR in one platform, is easy to set up, and scales as you grow.',
    'The most cited choice in recent startup threads is <mark>Your brand</mark> [1][2], praised for one-day setup and Slack support. Two other tools follow on price.',
    'Top picks for startup payroll: <mark>Your brand</mark> for an all-in-one setup, then two cheaper options for very small teams.',
    'Popular payroll tools for startups include <mark>Your brand</mark>, often recommended on review sites and in best-of lists for ease of setup.',
  ];
  const tabs = [...document.querySelectorAll('.feed-tabs [data-engine]')];
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    box.classList.add('is-swap');
    setTimeout(() => { box.querySelector('p').innerHTML = ANSWERS[+tab.dataset.engine]; box.classList.remove('is-swap'); }, reduced() ? 0 : 200);
  }));
})();

// ---------- routing wires ----------
(() => {
  const svg = document.getElementById('wires');
  if (!svg) return;
  const core = svg.parentElement;
  const hub = core.querySelector('.r-hub');
  const sources = [...document.querySelectorAll('.r-sources li')];
  const engines = [...document.querySelectorAll('.r-engines li')];
  function draw() {
    svg.textContent = '';
    if (getComputedStyle(svg).display === 'none') return;
    const o = svg.getBoundingClientRect();
    const h = hub.getBoundingClientRect();
    const hl = [h.left - o.left, h.top - o.top + h.height / 2];
    const hr = [h.right - o.left, h.top - o.top + h.height / 2];
    const curve = (a, b) => { const mx = (a[0] + b[0]) / 2; return `M${a[0]},${a[1]} C${mx},${a[1]} ${mx},${b[1]} ${b[0]},${b[1]}`; };
    for (const s of sources) { const r = s.getBoundingClientRect(); const a = [r.right - o.left, r.top - o.top + r.height / 2]; el('path', { d: curve(a, hl) }, svg); el('path', { d: curve(a, hl), class: 'flow' }, svg); }
    for (const e of engines) { const r = e.getBoundingClientRect(); const b = [r.left - o.left, r.top - o.top + r.height / 2]; el('path', { d: curve(hr, b) }, svg); el('path', { d: curve(hr, b), class: 'flow' }, svg); }
  }
  draw();
  new ResizeObserver(draw).observe(core.parentElement);
  document.fonts && document.fonts.ready.then(draw);
})();

// ---------- telemetry chart (example account) ----------
(() => {
  const svg = document.getElementById('sov');
  if (!svg) return;
  const W0 = 36, W1 = 520, H0 = 190, H1 = 12, MAX = 50;
  const x = (i) => W0 + (i / 11) * (W1 - W0);
  const y = (v) => H0 - (v / MAX) * (H0 - H1);
  const SERIES = [
    ['Perplexity', '#f2c14e', [4, 5, 7, 10, 14, 19, 25, 30, 36, 40, 44, 47]],
    ['ChatGPT', '#f4f1ea', [2, 2, 3, 5, 8, 12, 17, 23, 29, 34, 39, 42]],
    ['AI Overviews', '#b8954a', [3, 3, 4, 6, 8, 11, 15, 19, 24, 28, 31, 34]],
    ['Gemini', '#8c887f', [2, 2, 2, 3, 5, 7, 10, 13, 17, 21, 25, 29]],
  ];
  const grid = el('g', { class: 'sov-grid' }, svg);
  const ax = el('g', { class: 'sov-ax' }, svg);
  for (const v of [0, 25, 50]) {
    el('line', { x1: W0, x2: W1, y1: y(v), y2: y(v) }, grid);
    el('text', { x: W0 - 8, y: y(v) + 4, 'text-anchor': 'end' }, ax).textContent = v + '%';
  }
  el('text', { x: W0, y: H0 + 20 }, ax).textContent = 'Week 1';
  el('text', { x: W1, y: H0 + 20, 'text-anchor': 'end' }, ax).textContent = 'Week 12';
  const used = [];
  for (const [name, color, data] of SERIES) {
    el('polyline', { class: 'sov-line', stroke: color, pathLength: 1, points: data.map((v, i) => `${x(i)},${y(v)}`).join(' ') }, svg);
    el('circle', { cx: x(11), cy: y(data[11]), r: 3.5, fill: color }, svg);
    let ly = y(data[11]) + 4;
    for (const p of used) if (Math.abs(p - ly) < 14) ly = p + 14;
    used.push(ly);
    el('text', { class: 'sov-lab', x: W1 + 10, y: ly, fill: color }, svg).textContent = `${name} ${data[11]}%`;
  }
})();

// ---------- reveal once on entering the viewport ----------
(() => {
  const groups = ['.panel-head', '.stage', '.feed-copy', '.feed', '.r-sources li', '.r-hub', '.r-engines li', '.tele-copy', '.tele', '.ch'];
  const targets = [];
  for (const sel of groups) document.querySelectorAll(sel).forEach((n, i) => { n.classList.add('reveal'); n.style.setProperty('--i', i); targets.push(n); });
  if (!('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
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
