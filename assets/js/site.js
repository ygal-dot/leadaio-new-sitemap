// LeadAIO: mission control. Everything here enhances a page that reads fine without it.

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// every page opens at the top (unless the link points to a section)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
let touched = false;
['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => addEventListener(t, () => { touched = true; }, { once: true, passive: true }));
const toTop = () => {
  if (location.hash || touched) return;
  window.scrollTo(0, 0);
  // inside a frame (the claude.ai preview), also bring the frame's top into view in the page around it
  if (window.top !== window) {
    const html = document.documentElement, pad = html.style.scrollPaddingTop;
    html.style.scrollPaddingTop = '0px'; // the header offset is for in-page anchors, not for this
    try { html.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (e) { /* not allowed: ignore */ }
    html.style.scrollPaddingTop = pad;
  }
};
toTop();
document.addEventListener('DOMContentLoaded', toTop);
addEventListener('pageshow', toTop);
addEventListener('load', toTop);

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
  const p = box.querySelector('p');
  const q = document.querySelector('.feed-q');
  const qText = q.lastChild; // the prompt's text node, after its icon
  const PROMPT = qText.textContent;
  const sources = document.querySelector('.feed-sources');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let run = 0; // bumping this cancels any stream in progress (interruptible)

  // stream an answer word by word, the way an assistant writes it
  async function stream(html, withPrompt) {
    const id = ++run;
    if (reduced()) { qText.textContent = PROMPT; p.innerHTML = html; sources.classList.remove('is-hidden'); return; }
    sources.classList.add('is-hidden');
    if (withPrompt) {
      qText.textContent = '';
      for (let i = 1; i <= PROMPT.length; i++) { if (id !== run) return; qText.textContent = PROMPT.slice(0, i); await wait(32); }
      await wait(250);
    }
    p.innerHTML = '<span class="thinking" aria-hidden="true"><i></i><i></i><i></i></span>';
    await wait(700);
    if (id !== run) return;
    const tokens = html.match(/<mark>.*?<\/mark>|\S+/g) || [];
    let out = '';
    for (const t of tokens) {
      if (id !== run) return;
      out += (out ? ' ' : '') + t;
      p.innerHTML = out + '<span class="caret" aria-hidden="true"></span>';
      await wait(t.startsWith('<mark>') ? 140 : 42);
    }
    p.innerHTML = out;
    sources.classList.remove('is-hidden');
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    stream(ANSWERS[+tab.dataset.engine], false);
  }));

  // the first answer streams once, when the feed scrolls into view
  if ('IntersectionObserver' in window && !reduced()) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); stream(ANSWERS[0], true); }
    }, { threshold: 0.45 });
    io.observe(box.closest('.feed'));
  }
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
    const wires = [];
    for (const s of sources) { const r = s.getBoundingClientRect(); wires.push(curve([r.right - o.left, r.top - o.top + r.height / 2], hl)); }
    for (const e of engines) { const r = e.getBoundingClientRect(); wires.push(curve(hr, [r.left - o.left, r.top - o.top + r.height / 2])); }
    wires.forEach((d, i) => {
      el('path', { d, id: `wire-${i}` }, svg);
      el('path', { d, class: 'flow' }, svg);
      if (reduced()) return;
      // a pulse travels each wire: sources first, then out to the engines
      const dot = el('circle', { r: 3.5, class: 'pulse' }, svg);
      const am = el('animateMotion', { dur: '2.2s', repeatCount: 'indefinite', begin: `${(i % 5) * 0.35 + (i >= sources.length ? 1.1 : 0)}s`, keyPoints: '0;1', keyTimes: '0;1', calcMode: 'spline', keySplines: '0.77 0 0.175 1' }, dot);
      const mp = el('mpath', {}, am);
      mp.setAttribute('href', `#wire-${i}`);
    });
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
    ['Perplexity', '#d6ae4b', [4, 5, 7, 10, 14, 19, 25, 30, 36, 40, 44, 47]],
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
  const groups = ['.panel-head', '.stage', '.feed-copy', '.feed', '.r-sources li', '.r-hub', '.r-engines li', '.tele-copy', '.tele', '.ch', '.shift', '.rules li', '.never-list li', '.cover > div', '.agenda li', '.briefing', '.msg-copy', '.msg-form', '.mini-faq', '.about-why h2', '.never-copy', '.chips li', '.field', '.book legend', '.form-end', '.foot-in > *', '.foot-legal', '.contact-head', '.cta-row', '.agenda h2', '.versus-head', '.vt-row', '.programs-detail > h2', '.pd', '.case-steps li', '.case-meter', '.prompts-head', '.prompt-bar', '.prompt-list li', '.fit-col h2', '.fit-list li', '.monthly li', '.monthly-cta', '.cases-head', '.cs', '.sourced-head', '.sc', '.vz-intro', '.vz-aside', '.vz-copy > :not(.vz-caps)', '.vz-caps li', '.vz-read', '.win-copy > *', '.stats h2', '.ai-head', '.ash', '.ai-banner', '.dc', '.hw', '.pl', '.hub-core', '.ai-pill', '.wn li', '.ai-chart', '.df', '.pr'];
  const targets = [];
  for (const sel of groups) document.querySelectorAll(sel).forEach((n, i) => { n.classList.add('reveal'); n.style.setProperty('--i', i); targets.push(n); });
  // these only flip a state (track fill, corner brackets, table rows); they don't fade as a block
  document.querySelectorAll('.stages, .console--small, .agenda, .versus-table, .ai-shift, .ai-disc, .ai-proc').forEach((n) => targets.push(n));
  document.querySelectorAll('.tele-table tbody tr').forEach((r, i) => r.style.setProperty('--ri', i));
  // once an entrance has played, drop its delay so hover feedback is instant
  targets.forEach((t) => t.addEventListener('transitionend', (e) => {
    if (e.target === t && e.propertyName === 'transform' && t.classList.contains('is-in')) { t.classList.remove('reveal'); t.style.removeProperty('--i'); }
  }));
  if (!('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  targets.forEach((t) => io.observe(t));
  window.addEventListener('load', () => setTimeout(() => targets.forEach((t) => {
    const r = t.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) t.classList.add('is-in');
  }), 2000));
})();

// ---------- hero headline: each word rises from behind its own mask ----------
(() => {
  const h = document.querySelector('.hero h1, .page-hero h1');
  if (!h) return;
  const label = h.textContent.replace(/\s+/g, ' ').trim();
  h.setAttribute('aria-label', label);
  let wi = 0;
  const words = [];
  for (const node of [...h.childNodes]) {
    const text = node.textContent;
    for (const part of text.split(/([ \t\n]+)/)) {
      if (!part) continue;
      if (/^[ \t\n]+$/.test(part)) { words.push(document.createTextNode(' ')); continue; }
      const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span'); inner.textContent = part.replace(/ /g, ' '); inner.style.setProperty('--wi', wi++);
      w.appendChild(inner); words.push(w);
    }
  }
  h.textContent = '';
  words.forEach((w) => h.appendChild(w));
  document.querySelectorAll('.telemetry > div').forEach((d, i) => d.style.setProperty('--ti', i));
})();

// ---------- cursor telemetry: a crosshair with live coordinates over the console ----------
(() => {
  const consoleEl = document.querySelector('.hero .console');
  if (!consoleEl || !matchMedia('(hover: hover) and (pointer: fine)').matches || reduced()) return;
  const wrap = document.createElement('div');
  wrap.className = 'xhair'; wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = '<i class="xh"></i><i class="xv"></i><span class="xl"></span>';
  consoleEl.prepend(wrap);
  const [xh, xv] = wrap.querySelectorAll('i');
  const xl = wrap.querySelector('.xl');
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, rect = consoleEl.getBoundingClientRect();
  const tick = () => {
    // a light follow: the crosshair trails the pointer instead of snapping to it
    cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
    xh.style.transform = `translate3d(0, ${cy}px, 0)`;
    xv.style.transform = `translate3d(${cx}px, 0, 0)`;
    xl.style.transform = `translate3d(${Math.min(cx + 12, rect.width - 150)}px, ${Math.max(cy - 28, 4)}px, 0)`;
    xl.textContent = `${(cx / rect.width * 100).toFixed(4)}° · ${((1 - cy / rect.height) * 100).toFixed(4)}°`;
    if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) raf = requestAnimationFrame(tick); else raf = 0;
  };
  consoleEl.addEventListener('pointerenter', (e) => {
    rect = consoleEl.getBoundingClientRect();
    cx = tx = e.clientX - rect.left; cy = ty = e.clientY - rect.top;
    consoleEl.classList.add('is-tracking'); tick();
  });
  consoleEl.addEventListener('pointermove', (e) => {
    tx = e.clientX - rect.left; ty = e.clientY - rect.top;
    if (!raf) raf = requestAnimationFrame(tick);
  });
  consoleEl.addEventListener('pointerleave', () => consoleEl.classList.remove('is-tracking'));
  addEventListener('scroll', () => { rect = consoleEl.getBoundingClientRect(); }, { passive: true });
})();

// ---------- sample logos: a slow marquee (the copy is hidden from assistive tech) ----------
(() => {
  const row = document.querySelector('.logo-row');
  if (!row || reduced()) return;
  const vp = document.createElement('div');
  vp.className = 'logo-viewport';
  row.parentNode.insertBefore(vp, row);
  vp.appendChild(row);
  [...row.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); row.appendChild(c); });
  row.classList.add('is-marquee');
})();

// ---------- mobile menu: close on navigation or outside click ----------
(() => {
  const menu = document.querySelector('.menu');
  if (!menu) return;
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.removeAttribute('open')));
  document.addEventListener('click', (e) => { if (menu.open && !menu.contains(e.target)) menu.removeAttribute('open'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { menu.removeAttribute('open'); menu.querySelector('summary').focus(); } });
})();

// ---------- mission log (about): lines arrive in order, like a log being written ----------
(() => {
  const lines = document.querySelectorAll('.log-lines li');
  if (!lines.length || reduced()) return;
  lines.forEach((li) => { li.style.opacity = '0'; li.style.transform = 'translateY(6px)'; li.style.transition = 'opacity 400ms cubic-bezier(0.23, 1, 0.32, 1), transform 500ms cubic-bezier(0.23, 1, 0.32, 1)'; });
  const show = () => lines.forEach((li, i) => setTimeout(() => { li.style.opacity = '1'; li.style.transform = 'none'; }, 500 + i * 380));
  if (document.readyState === 'complete') show(); else addEventListener('load', show, { once: true });
})();

// ---------- forms: validate, then open a prefilled email (no backend yet) ----------
(() => {
  document.querySelectorAll('form[data-mailto]').forEach((form) => {
    const done = form.querySelector('.form-done');
    const fields = [...form.querySelectorAll('.field')];
    const check = (field) => {
      const input = field.querySelector('input[required], textarea[required]');
      if (!input) return true;
      const ok = input.value.trim() !== '' && (input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
      field.classList.toggle('is-bad', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      const err = field.querySelector('.err');
      if (err) { if (!err.id) err.id = (input.id || 'f') + '-err'; input.setAttribute('aria-describedby', err.id); }
      return ok;
    };
    // fix errors as soon as the visitor corrects them, never before they leave a field
    fields.forEach((f) => f.addEventListener('focusout', () => { if (f.classList.contains('is-bad') || f.dataset.touched) check(f); f.dataset.touched = '1'; }));
    fields.forEach((f) => f.addEventListener('input', () => { if (f.classList.contains('is-bad')) check(f); }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = fields.filter((f) => !check(f));
      if (bad.length) { bad[0].querySelector('input, textarea').focus(); return; }
      const data = new FormData(form);
      const lines = [];
      const seen = new Set();
      for (const [k] of data) {
        if (seen.has(k)) continue; seen.add(k);
        const v = data.getAll(k).map((x) => String(x).trim()).filter(Boolean).join(', ');
        if (v) lines.push(`${k}: ${v}`);
      }
      const subject = `${form.dataset.subject}${data.get('Company') ? ' · ' + data.get('Company') : ''}`;
      location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      form.classList.add('is-sent');
      done.hidden = false;
      done.focus();
    });
    const again = form.querySelector('#brief-again, [data-again]');
    again && again.addEventListener('click', () => { form.classList.remove('is-sent'); done.hidden = true; form.querySelector('input, textarea').focus(); });
  });
})();

// ---------- booking: the briefing card mirrors the form as it is filled in ----------
(() => {
  const form = document.getElementById('brief-form');
  if (!form) return;
  const out = (k) => document.querySelector(`[data-show="${k}"]`);
  const required = ['f-name', 'f-email', 'f-company', 'f-cat'].map((id) => document.getElementById(id));
  const bar = document.getElementById('brief-bar');
  const count = document.getElementById('brief-n');
  const status = document.getElementById('brief-status');
  const set = (k, v) => {
    const dd = out(k); if (!dd) return;
    const text = v || dd.dataset.empty;
    if (dd.textContent === text) return;
    dd.textContent = text;
    dd.classList.toggle('is-empty', !v);
    dd.classList.remove('is-fresh'); void dd.offsetWidth; if (v && !reduced()) dd.classList.add('is-fresh');
  };
  const sync = () => {
    set('name', [form.elements['Name'].value.trim(), form.elements['Role'].value.trim()].filter(Boolean).join(', '));
    set('company', [form.elements['Company'].value.trim(), form.elements['Website'].value.trim().replace(/^https?:\/\//, '')].filter(Boolean).join(' · '));
    set('category', form.elements['Category'].value.trim());
    set('rivals', form.elements['Rivals AI names'].value.trim());
    set('engines', [...form.querySelectorAll('input[name="Engines"]:checked')].map((c) => c.value).join(', '));
    set('time', (form.querySelector('input[name="Best time"]:checked') || {}).value || '');
    const n = required.filter((i) => i.value.trim() && (i.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim()))).length;
    count.textContent = n;
    bar.parentElement.style.setProperty('--p', n / 4);
    bar.style.setProperty('--p', n / 4);
    status.textContent = n === 4 ? 'Ready to send' : 'Draft';
    status.classList.toggle('is-ready', n === 4);
  };
  form.addEventListener('input', sync);
  form.addEventListener('change', sync);
  ['name', 'company', 'category', 'rivals'].forEach((k) => out(k).classList.add('is-empty'));
  sync();
})();

// ---------- program deep-dive: tabs with a sliding gold indicator ----------
(() => {
  const list = document.querySelector('.pd-tabs');
  if (!list) return;
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const ind = document.createElement('span');
  ind.className = 'pd-ind'; ind.setAttribute('aria-hidden', 'true');
  list.appendChild(ind);
  const place = () => {
    const t = tabs.find((b) => b.getAttribute('aria-selected') === 'true');


    ind.style.cssText = `--y:${t.offsetTop}px;--h:${t.offsetHeight};--x:${t.offsetLeft}px;--w:${t.offsetWidth}`;
  };
  const select = (t, focus) => {
    tabs.forEach((b) => {
      const on = b === t;
      b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(b.getAttribute('aria-controls'));
      if (on && panel.hidden) { panel.hidden = false; panel.classList.remove('is-enter'); void panel.offsetWidth; panel.classList.add('is-enter'); }
      else if (!on) panel.hidden = true;
    });
    if (focus) t.focus();
    if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: t.offsetLeft - 16, behavior: reduced() ? 'auto' : 'smooth' });
    place();
  };
  tabs.forEach((t) => t.addEventListener('click', () => select(t)));
  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    let n = null;
    if (k) n = (i + k + tabs.length) % tabs.length; else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault(); select(tabs[n], true);
  });
  document.querySelectorAll('.pd-panel').forEach((p) => p.addEventListener('animationend', (e) => { if (e.target === p) p.classList.remove('is-enter'); }));
  place();
  addEventListener('resize', place);
  if (document.fonts) document.fonts.ready.then(place);
})();

// ---------- example mission: the meter follows the week you are reading ----------
(() => {
  const steps = [...document.querySelectorAll('.case-steps li')];
  const nEl = document.getElementById('cm-n');
  if (!steps.length || !nEl) return;
  const bars = document.getElementById('cm-bars'), week = document.getElementById('cm-week'), track = document.querySelector('.case-steps');
  // example data: prompts named (of 40) and named first, by week
  const DATA = { 1: [2, 0], 3: [4, 0], 6: [7, 2], 9: [11, 4], 12: [16, 7] };
  const cells = Array.from({ length: 40 }, (_, k) => { const c = document.createElement('i'); c.style.setProperty('--k', k); bars.appendChild(c); return c; });
  let cur = 0, active = null, raf = 0;
  const count = (to) => {
    cancelAnimationFrame(raf);
    const from = cur, t0 = performance.now(), dur = reduced() ? 0 : 600;
    const tick = (now) => {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1;
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      nEl.textContent = v;
      if (p < 1) raf = requestAnimationFrame(tick); else cur = to;
    };
    raf = requestAnimationFrame(tick);
  };
  const activate = (li) => {
    if (li === active) return;
    active = li;
    const w = +li.dataset.w, [named, first] = DATA[w], idx = steps.indexOf(li);
    steps.forEach((s, j) => { s.classList.toggle('is-on', j === idx); s.classList.toggle('is-past', j < idx); });
    track.style.setProperty('--p', steps.length > 1 ? idx / (steps.length - 1) : 1);
    cells.forEach((c, k) => { c.classList.toggle('is-on', k < named); c.classList.toggle('is-first', k < first); });
    week.textContent = `Week ${w}${first ? ` · first on ${first}` : ''}`;
    nEl.classList.remove('is-tick'); void nEl.offsetWidth; if (!reduced()) nEl.classList.add('is-tick');
    count(named);
  };
  steps.forEach((li) => li.addEventListener('click', () => activate(li)));
  activate(steps[0]);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) activate(e.target);
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((li) => io.observe(li));
})();

// ---------- prompts we track: filter by intent ----------
(() => {
  const btns = [...document.querySelectorAll('.prompt-filter button')];
  if (!btns.length) return;
  const items = [...document.querySelectorAll('.prompt-list li')];
  const out = document.getElementById('prompt-count');
  btns.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.intent;
    btns.forEach((x) => x.setAttribute('aria-pressed', x === b));
    let k = 0;
    items.forEach((li) => {
      const show = f === 'all' || li.dataset.intent === f;
      li.hidden = !show;
      li.classList.remove('is-pop');
      if (show) { void li.offsetWidth; li.style.setProperty('--k', k++); li.classList.add('is-pop'); }
    });
    if (out) out.textContent = `${k} of ${items.length} prompts`;
  }));
  items.forEach((li) => li.addEventListener('animationend', () => li.classList.remove('is-pop')));
})();

// ---------- phones: swipe rows show where you are ----------
(() => {
  document.querySelectorAll('.stages, .monthly, .cases-grid').forEach((row) => {
    const items = [...row.children];
    const hint = document.createElement('p');
    hint.className = 'swipe-hint'; hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = `Swipe <b>1 / ${items.length}</b><span class="swipe-dots">${items.map(() => '<i></i>').join('')}</span>`;
    row.after(hint);
    const n = hint.querySelector('b'), dots = [...hint.querySelectorAll('i')];
    const update = () => {
      const left = row.getBoundingClientRect().left;
      let best = 0, d = Infinity;
      items.forEach((it, i) => { const x = Math.abs(it.getBoundingClientRect().left - left - parseFloat(getComputedStyle(row).paddingLeft)); if (x < d) { d = x; best = i; } });
      if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 4) best = items.length - 1;
      n.textContent = `${best + 1} / ${items.length}`;
      dots.forEach((dot, i) => dot.classList.toggle('is-on', i === best));
    };
    let raf = 0;
    row.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true });
    update();
  });
})();

// ---------- about: launch panel, a rocket that flies to "Named first" on a loop ----------
(() => {
  const scene = document.querySelector('.launch');
  if (!scene) return;
  const rk = scene.querySelector('#rk'), path = scene.querySelector('#rk-path'), status = scene.querySelector('#rk-status');
  const L = path.getTotalLength();
  path.style.strokeDasharray = `${L} ${L}`;
  const place = (t) => {
    const d = Math.min(L, t * L), p = path.getPointAtLength(d), q = path.getPointAtLength(Math.min(L, d + 1)), q0 = path.getPointAtLength(Math.max(0, d - 1));
    const a = Math.atan2(q.y - q0.y, q.x - q0.x) * 180 / Math.PI;
    rk.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${a.toFixed(2)})`);
    path.style.strokeDashoffset = L - d;
  };
  const set = (...on) => ['is-lit', 'is-ignite', 'is-docked', 'is-gone', 'is-fade'].forEach((c) => scene.classList.toggle(c, on.includes(c)));
  if (reduced()) { place(0.62); set('is-lit'); status.textContent = 'In flight'; return; }

  let timers = [], raf = 0, running = false;
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); running = false; };
  const fly = () => {
    const t0 = performance.now(), dur = 3200;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // ease-in-out: lift slowly, coast in
      place(e);
      status.textContent = k < 0.15 ? 'Liftoff' : `In flight · ${Math.round(e * 100)}%`;
      if (k > 0.12) scene.classList.remove('is-ignite');
      if (k < 1) raf = requestAnimationFrame(step); else dock();
    };
    raf = requestAnimationFrame(step);
  };
  const dock = () => {
    set('is-docked', 'is-gone'); status.textContent = 'Named first';
    later(1600, () => set('is-gone', 'is-fade', 'is-docked'));
    later(2400, () => { place(0); set('is-gone', 'is-fade'); status.textContent = 'Ready on the pad'; });
    later(2600, () => set());
    later(3600, cycle);
  };
  const cycle = () => {
    running = true; place(0); set();
    ['T-3', 'T-2', 'T-1'].forEach((txt, i) => later(i * 450, () => { status.textContent = txt; }));
    later(700, () => set('is-lit', 'is-ignite'));
    later(1400, fly);
  };
  place(0);
  if (!('IntersectionObserver' in window)) { cycle(); return; }
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { later(300, cycle); running = true; }
    else if (!e.isIntersecting && running) { stop(); place(0); set(); status.textContent = 'Ready on the pad'; }
  }, { threshold: 0.35 }).observe(scene);
})();

// ---------- case studies: sparklines draw and the headline number counts up ----------
(() => {
  const cards = document.querySelectorAll('.cs');
  if (!cards.length) return;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };
  // one shared gradient for the area fills
  const defs = mk('svg', { width: 0, height: 0, 'aria-hidden': 'true', style: 'position:absolute' }, document.body);
  const g = mk('linearGradient', { id: 'sp-fade', x1: 0, y1: 0, x2: 0, y2: 1 }, mk('defs', {}, defs));
  mk('stop', { offset: '0', 'stop-color': '#d6ae4b', 'stop-opacity': '0.22' }, g);
  mk('stop', { offset: '1', 'stop-color': '#d6ae4b', 'stop-opacity': '0' }, g);
  cards.forEach((card) => {
    const svg = card.querySelector('.cs-spark');
    const d = svg.dataset.series.split(',').map(Number);
    const W = 240, H = 56, max = 40 * 0.55, x = (i) => (i / (d.length - 1)) * W, y = (v) => H - 4 - (v / max) * (H - 10);
    const pts = d.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    mk('line', { class: 'sp-base', x1: 0, y1: H - 4, x2: W, y2: H - 4 }, svg);
    mk('path', { class: 'sp-area', d: `M0,${H - 4} L${pts.join(' L')} L${W},${H - 4} Z` }, svg);
    mk('path', { class: 'sp-line', d: `M${pts.join(' L')}`, pathLength: 1 }, svg);
    mk('circle', { class: 'sp-end', cx: x(d.length - 1), cy: y(d[d.length - 1]), r: 3.5, fill: '#d6ae4b' }, svg);
  });
  const count = (b) => {
    const from = +b.dataset.from, to = +b.dataset.to;
    if (reduced()) { b.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(tick); };
    b.textContent = from; requestAnimationFrame(tick);
  };
  const live = (card) => { if (card.classList.contains('is-live')) return; card.classList.add('is-live'); count(card.querySelector('.cs-metric b')); };
  if (!('IntersectionObserver' in window) || reduced()) { cards.forEach(live); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { live(e.target); io.unobserve(e.target); } }), { threshold: 0.4 });
  cards.forEach((c) => io.observe(c));
})();

// ---------- radar console: rings draw, readouts count up, sweep runs only while visible ----------
(() => {
  const radar = document.querySelector('.radar');
  if (!radar) return;
  const read = document.querySelector('.vz-read');
  const deg = document.getElementById('rd-deg');
  const sweep = radar.querySelector('.rd-sweep');
  const count = (b) => {
    const to = +b.dataset.to, pre = b.dataset.pre || '';
    const t0 = performance.now(), dur = 1300;
    const tick = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = pre + Math.round(to * e); if (k < 1) requestAnimationFrame(tick); };
    b.textContent = pre + '0'; requestAnimationFrame(tick);
  };
  // the angle readout follows the beam
  let raf = 0, visible = false;
  const angle = () => {
    const m = getComputedStyle(sweep).transform;
    if (m && m !== 'none') { const [a, b] = m.slice(7, -1).split(',').map(Number); deg.textContent = String(Math.round(((Math.atan2(b, a) * 180 / Math.PI) + 360) % 360)).padStart(3, '0'); }
    if (visible) raf = requestAnimationFrame(angle);
  };
  if (!('IntersectionObserver' in window) || reduced()) { radar.classList.add('is-live'); deg.textContent = '120'; return; }
  let played = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    radar.classList.toggle('is-paused', !visible);
    if (visible) { raf = requestAnimationFrame(angle); if (!played) { played = true; radar.classList.add('is-live'); read.querySelectorAll('b[data-to]').forEach(count); } }
    else cancelAnimationFrame(raf);
  }, { threshold: 0.2 }).observe(radar);
})();

// ---------- testimonials: two columns drift in opposite directions while in view ----------
(() => {
  const wall = document.querySelector('.win-wall');
  if (!wall) return;
  const cols = [...wall.querySelectorAll('.win-col')];
  // on phones only the first column shows, so it also carries the second column's quotes
  if (matchMedia('(max-width: 760px)').matches && cols[1]) {
    [...cols[1].children].forEach((li) => { const c = li.cloneNode(true); c.classList.add('tq-extra'); cols[0].appendChild(c); });
  }
  if (reduced()) return;
  cols.forEach((col) => {
    [...col.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); col.appendChild(c); });
    col.classList.add('is-loop');
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => wall.classList.toggle('is-paused', !e.isIntersecting)).observe(wall);
})();

// ---------- AI search stats: numbers count up, rules draw, highlights sweep ----------
(() => {
  const items = [...document.querySelectorAll('.st')];
  if (!items.length) return;
  items.forEach((it, k) => it.style.setProperty('--k', k));
  const count = (b, delay) => {
    const to = parseFloat(b.dataset.to), dec = +b.dataset.dec || 0;
    b.textContent = (0).toFixed(dec);
    setTimeout(() => {
      const t0 = performance.now(), dur = 1500;
      const tick = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4); b.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, delay);
  };
  if (!('IntersectionObserver' in window) || reduced()) { items.forEach((it) => it.classList.add('is-live')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const it = e.target, k = items.indexOf(it);
    it.classList.add('is-live'); count(it.querySelector('.st-n b'), k * 150); io.unobserve(it);
  }), { threshold: 0.4 });
  items.forEach((it) => io.observe(it));
})();

// ---------- AI Optimization page: platform hub wires with gold pulses ----------
(() => {
  const hub = document.querySelector('.ai-hub');
  if (!hub) return;
  const svg = hub.querySelector('.hub-wires'), core = hub.querySelector('.hub-core');
  const NS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('.serp li').forEach((li, k) => li.style.setProperty('--k', k));
  const draw = () => {
    svg.innerHTML = '';
    if (getComputedStyle(svg).display === 'none') return;
    const box = hub.getBoundingClientRect(), c = core.getBoundingClientRect();
    const cx = c.left + c.width / 2 - box.left, cy = c.top + c.height / 2 - box.top, r = c.width / 2;
    hub.querySelectorAll('.pl').forEach((pl, i) => {
      const p = pl.getBoundingClientRect(), left = pl.classList.contains('pl--l');
      const x1 = (left ? p.right : p.left) - box.left, y1 = p.top + p.height / 2 - box.top;
      const ang = Math.atan2(y1 - cy, x1 - cx), x2 = cx + Math.cos(ang) * r, y2 = cy + Math.sin(ang) * r;
      const mx = (x1 + x2) / 2;
      const d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
      const base = document.createElementNS(NS, 'path'); base.setAttribute('d', d); svg.appendChild(base);
      const flow = document.createElementNS(NS, 'path'); flow.setAttribute('d', d); flow.setAttribute('class', 'on'); svg.appendChild(flow);
      if (!reduced()) {
        const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('r', '3.2');
        const am = document.createElementNS(NS, 'animateMotion');
        am.setAttribute('dur', `${2.6 + (i % 4) * 0.35}s`); am.setAttribute('repeatCount', 'indefinite'); am.setAttribute('begin', `${(i * 0.4).toFixed(1)}s`);
        am.setAttribute('path', d); am.setAttribute('keyPoints', '0;1'); am.setAttribute('keyTimes', '0;1');
        dot.appendChild(am); svg.appendChild(dot);
      }
    });
  };
  draw();
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 150); });
  if (document.fonts) document.fonts.ready.then(draw);
})();

// ---------- live chat ----------
// Wire your chat widget by defining window.LeadAIOChat.open(). Until then the link opens an email.
document.querySelectorAll('[data-chat]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  if (window.LeadAIOChat && typeof window.LeadAIOChat.open === 'function') window.LeadAIOChat.open();
  else window.location.href = 'mailto:success@leadaio.com?subject=Live%20chat%20request';
}));
