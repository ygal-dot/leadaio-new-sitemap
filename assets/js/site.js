// LeadAIO · page behaviour. Everything here is progressive: the page reads fine without it.

// ---------- reveal once on entering the viewport ----------
(() => {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  // safety net: never leave on-screen content hidden
  window.addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
})();

// ---------- the answer you can type ----------
(() => {
  const q = document.getElementById('ask-q');
  const brandInput = document.getElementById('ask-brand');
  const box = document.querySelector('.answer');
  if (!q || !box) return;
  const $ = (id) => document.getElementById(id);
  const tabs = [...box.querySelectorAll('[data-engine]')];
  let engine = 'ChatGPT';

  const SUBS = [
    [/payroll|accounting|invoice|bookkeep|tax/, 'r/smallbusiness'],
    [/crm|sales|lead|pipeline/, 'r/sales'],
    [/secur|cyber|soc|pentest|firewall/, 'r/cybersecurity'],
    [/chair|desk|office/, 'r/OfficeChairs'],
    [/market|seo|ads|agency/, 'r/marketing'],
    [/dev|code|api|database|cloud|hosting/, 'r/webdev'],
    [/hr|hiring|recruit/, 'r/humanresources'],
    [/shop|ecommerce|store/, 'r/ecommerce'],
  ];
  const isSoftware = /software|crm|tool|platform|app|saas|api|database|hosting|cloud/;
  const isService = /firm|agenc|consult|provider|service|partner|compan/;

  function parse(text) {
    let t = text.toLowerCase().trim().replace(/[?.!]+$/, '');
    let audience = '';
    const m = t.match(/\s(for|in)\s(.+)$/);
    if (m) { audience = `${m[1]} ${m[2]}`; t = t.slice(0, m.index); }
    t = t.replace(/^(what (is|are) the |which |who makes the |who are the |the )/, '')
         .replace(/^(best|top|leading|good|great|most popular)\s+/, '')
         .replace(/^(best|top)\s+/, '').trim();
    return { category: t || 'options', audience };
  }

  function render() {
    const { category, audience } = parse(q.value || '');
    const brand = (brandInput && brandInput.value.trim()) || 'Your brand';
    const aud = audience ? ` ${audience}` : '';
    const leads = {
      'ChatGPT': `Here are the ${category} options people recommend most${aud}:`,
      'Perplexity': `Based on recent reviews and community threads, the leading ${category}${aud} are:`,
      'Gemini': `Top picks for ${category}${aud}:`,
      'AI Overviews': `Popular ${category}${aud} include:`,
    };
    const whys = {
      'ChatGPT': 'named most often in recent threads and reviews',
      'Perplexity': 'the most cited choice across community discussions [1][2]',
      'Gemini': 'highly rated for support and ease of setup',
      'AI Overviews': 'frequently recommended on review sites and in best-of lists',
    };
    const all = `${category} ${audience}`;
    const sub = (SUBS.find(([re]) => re.test(all)) || [null, 'r/' + (category.split(' ').pop() || 'AskReddit')])[1];
    const review = isSoftware.test(all) ? 'g2.com' : isService.test(all) ? 'clutch.co' : 'trustpilot.com';
    const year = new Date().getFullYear();
    $('ans-lead').textContent = leads[engine];
    $('ans-brand').textContent = brand;
    $('ans-why').textContent = whys[engine];
    $('src-1').textContent = `reddit.com · ${sub}`;
    $('src-2').textContent = `${review} · ${category}`;
    $('src-3').textContent = `“Best ${category} in ${year}”`;
  }

  let timer;
  const update = () => {
    box.classList.add('is-typing');
    clearTimeout(timer);
    timer = setTimeout(() => { render(); box.classList.remove('is-typing'); }, 280);
  };
  q.addEventListener('input', update);
  brandInput && brandInput.addEventListener('input', update);

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    engine = tab.dataset.engine;
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    update();
  }));

  document.querySelectorAll('.ask-examples [data-q]').forEach((b) => b.addEventListener('click', () => {
    q.value = b.dataset.q;
    update();
    q.focus({ preventScroll: true });
    q.setSelectionRange(q.value.length, q.value.length);
  }));

  render();
})();

// ---------- live chat ----------
// Wire your chat widget by defining window.LeadAIOChat.open(). Until then the link opens an email.
document.querySelectorAll('[data-chat]').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  if (window.LeadAIOChat && typeof window.LeadAIOChat.open === 'function') window.LeadAIOChat.open();
  else window.location.href = 'mailto:success@leadaio.com?subject=Live%20chat%20request';
}));
