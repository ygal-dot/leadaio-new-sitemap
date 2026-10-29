# Builds deck/leadaio-deck.html from the site pages, then (with --pdf) renders deck/LeadAIO-deck.pdf.
# Usage: python3 deck/build_deck.py [--pdf]
import html, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
read = lambda f: open(os.path.join(ROOT, f)).read()
index, how, score, serve, about = (read(f) for f in ('index.html', 'how-it-works.html', 'ai-visibility-score.html', 'who-we-serve.html', 'about.html'))


def items(page, li_class):
    """Inner HTML of every <li class="li_class"...> in a page."""
    return re.findall(r'<li class="' + li_class + r'"[^>]*>(.*?)</li>', page, flags=re.S)


def grab(pattern, text):
    m = re.search(pattern, text, flags=re.S)
    assert m, pattern
    return m.group(1).strip()


svg = lambda t: grab(r'(<svg.*?</svg>)', t)
h3 = lambda t: grab(r'<h3>(.*?)</h3>', t)

engines = []
for t in re.findall(r'<li><span class="er-ic">(.*?)</li>', index, flags=re.S):
    engines.append((svg(t), grab(r'<span class="er-n">(.*?)</span>', t)))
disciplines = [(svg(t), h3(t), grab(r'</h3><p>(.*?)</p>', t)) for t in items(how, 'hw')]
stages = [(svg(t), h3(t), grab(r'<p class="pr-d">(.*?)</p>', t), grab(r'</p><p>(.*?)</p>', t)) for t in items(how, 'pr')]
platforms = [(svg(t), grab(r'<b>(.*?)</b>', t), grab(r'<small>(.*?)</small>', t)) for t in items(how, r'pl pl--[lr]')]
difference = [(svg(t), h3(t), grab(r'</h3><p>(.*?)</p>', t)) for t in items(about, 'df')]
roles = re.findall(r'<li><h3>(.*?)</h3><p>(.*?)</p></li>', grab(r'<ul class="monthly roles"[^>]*>(.*?)</ul>', serve))
you_get = re.findall(r'<li><h3>(.*?)</h3><p>(.*?)</p></li>', grab(r'<ul class="monthly" role="list">(.*?)</ul>', how))
readings = re.findall(r'<span class="vz-i">(\d+)</span><span>(.*?)</span>', score)
score_steps = re.findall(r'<li class="stage"><span class="stage-n">(\d+)</span><h3>(.*?)</h3><p>(.*?)</p></li>', score)
rules = re.findall(r'<li><h3>(.*?)</h3><p>(.*?)</p></li>', grab(r'<ul class="rules"[^>]*>(.*?)</ul>', about))
versus = re.findall(r'<div class="vt-row" role="row"><span role="rowheader">(.*?)</span><span role="cell">(.*?)</span><span role="cell">(.*?)</span></div>', index)
stats = re.findall(r'<b data-to="[^"]*" data-dec="\d">(.*?)</b>.*?<mark>(.*?)</mark>.*?<a href="([^"]+)"[^>]*>(.*?)</a>', index, flags=re.S)
disc = re.findall(r'<p class="dc-a">(.*?)</p><h3>(.*?)</h3><p>(.*?)</p>', how)
for name, n in [('engines', engines), ('disciplines', disciplines), ('stages', stages), ('platforms', platforms), ('difference', difference),
                ('roles', roles), ('you_get', you_get), ('readings', readings), ('score_steps', score_steps), ('rules', rules),
                ('versus', versus), ('stats', stats), ('disc', disc)]:
    assert n, name

LOGO = '<img class="logo" src="../assets/img/leadaio-logo.png" alt="LeadAIO">'
TOTAL = 14
n = 0


def slide(body, bg='', cls=''):
    global n
    n += 1
    bg_html = f'<div class="bgimg" style="background-image:url(../assets/img/{bg}.jpg)"></div>' if bg else ''
    return f'''<section class="slide {cls}">{bg_html}
  <span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span>
  <div class="inner">{body}</div>
  <footer class="sf"><img src="../assets/img/leadaio-logo.png" alt=""><span>{n:02d} / {TOTAL:02d}</span></footer>
</section>
'''


def head(kicker, title, lead=''):
    lead_html = f'<p class="lead">{lead}</p>' if lead else ''
    return f'<p class="k">{kicker}</p><h2>{title}</h2>{lead_html}'


S = []
# 01 cover
S.append(slide(f'''<div class="cover">
  {LOGO}
  <h1>Launch your brand into AI&nbsp;answers.</h1>
  <p class="lead">We get mid-market brands named and cited when buyers ask ChatGPT, Perplexity, Gemini and Google AI&nbsp;Overviews who to choose.</p>
  <ul class="engines">{''.join(f'<li><span>{s}</span>{t}</li>' for s, t in engines)}</ul>
</div>''', 'bg-terrain', 'is-cover'))
# 02 stats
S.append(slide(head('The shift', 'AI search isn&rsquo;t coming. <span class="g">It&rsquo;s already here.</span>') + '<ul class="stats">' + ''.join(
    f'<li><b>{v}<i>%</i></b><p>{l}</p><small>Source: {src_t}</small></li>' for v, l, _, src_t in stats) + '</ul>'))
# 03 then / now
S.append(slide(head('The shift is here', 'Search used to be a list. Now it is an&nbsp;answer.') + '''<div class="tn">
  <div class="tn-c"><p class="k2">Then</p><ul><li>Search: ten blue links.</li><li>Endless scrolling.</li><li>You search. You sift. You hope.</li></ul></div>
  <div class="tn-arrow">&rsaquo;&rsaquo;&rsaquo;</div>
  <div class="tn-c is-now"><p class="k2">Now</p><ul><li>AI answers.</li><li>Clear insights.</li><li>Instant recommendations.</li></ul><p class="door">AI is the new <span class="g">front door</span> to your business.</p></div>
</div>
<p class="banner">If you are not optimized for AI, you are <span class="g">invisible</span> to the next generation of buyers.</p>''', 'bg-globe'))
# 04 SEO vs AIO
S.append(slide(head('What we do', 'SEO wins the click. <span class="g">AIO</span> wins the sentence.') + '<table class="vs"><thead><tr><th></th><th>Classic SEO</th><th class="g">AIO with LeadAIO</th></tr></thead><tbody>' + ''.join(
    f'<tr><th>{a}</th><td>{b}</td><td>{c}</td></tr>' for a, b, c in versus) + '</tbody></table>'))
# 05 AIO GEO AEO
S.append(slide(head('A complete AI visibility strategy', 'AIO <span class="g">/</span> GEO <span class="g">/</span> AEO') + '<ul class="disc">' + ''.join(
    f'<li><b>{a}</b><h3>{t}</h3><p>{p}</p></li>' for a, t, p in disc) + '</ul><p class="banner">Together, they form one complete <span class="g">AI visibility strategy</span>.</p>'))
# 06 four stages
S.append(slide(head('How it works', 'From audit to category leader.', 'No black box. Four stages, and you approve the plan before anything goes live.') + '<ol class="stages">' + ''.join(
    f'<li><span class="node">{s}</span><span class="num">{i:02d}</span><h3>{t}</h3><p class="when">{d}</p><p>{p}</p></li>' for i, (s, t, d, p) in enumerate(stages, 1)) + '</ol>', 'bg-grid'))
# 07 six disciplines
S.append(slide(head('How it works', 'Six disciplines behind every recommendation.') + '<ol class="grid3 icons">' + ''.join(
    f'<li><span class="ic">{s}</span><span class="num">{i:02d}</span><h3>{t}</h3><p>{p}</p></li>' for i, (s, t, p) in enumerate(disciplines, 1)) + '</ol>'))
# 08 platforms
S.append(slide(head('Complete AI ecosystem coverage', 'Platforms we optimize for.') + '<ul class="plats">' + ''.join(
    f'<li><span class="ic">{s}</span><b>{t}</b><small>{m}</small></li>' for s, t, m in platforms) + '</ul><p class="pill">+ All emerging AI assistants and answer engines</p>', 'bg-network'))
# 09 AI Visibility Score
S.append(slide(head('The entry offer', 'Your AI Visibility Score.', 'Your baseline: how often AI engines name your brand when buyers ask about your category, and who they name instead.') + '<div class="two"><div><p class="k2">Six readings, one baseline</p><ol class="readings">' + ''.join(
    f'<li><span>{i}</span>{t}</li>' for i, t in readings) + '</ol></div><div><p class="k2">How you get it</p><ol class="steps">' + ''.join(
    f'<li><span>{i}</span><div><h3>{t}</h3><p>{p}</p></div></li>' for i, t, p in score_steps) + '</ol></div></div>', 'bg-circuit'))
# 10 who we serve
S.append(slide(head('Who we serve', 'Built for mid&#8209;market brands.', 'Everyone at the table cares about AI answers for a different reason.') + '<ul class="grid3 cards">' + ''.join(
    f'<li><span class="num">{i:02d}</span><h3>{t}</h3><p>{p}</p></li>' for i, (t, p) in enumerate(roles, 1)) + '</ul>'))
# 11 what you see
S.append(slide(head('No black box', 'What you see along the way.') + '<ul class="grid3 cards">' + ''.join(
    f'<li><span class="num">{i:02d}</span><h3>{t}</h3><p>{p}</p></li>' for i, (t, p) in enumerate(you_get, 1)) + '</ul>', 'bg-contours'))
# 12 how we work + partners
S.append(slide(head('About LeadAIO', 'Built for the answer era.') + '<div class="two"><div><p class="k2">The partners</p><ul class="partners">' + ''.join(
    '<li><span class="ph">?</span><div><h3>[Partner name]</h3><p class="role">[Title]</p><p>[Short bio]</p></div></li>' for _ in range(2)) + '</ul></div><div><p class="k2">How we work</p><ul class="rules">' + ''.join(
    f'<li><h3>{t}</h3><p>{p}</p></li>' for t, p in rules) + '</ul></div></div>', 'bg-trail'))
# 13 difference
S.append(slide(head('Why LeadAIO', 'The LeadAIO difference.') + '<ul class="grid3 icons">' + ''.join(
    f'<li><span class="ic">{s}</span><h3>{t}</h3><p>{p}</p></li>' for s, t, p in difference) + '</ul>'))
# 14 CTA
S.append(slide(f'''<div class="cover close">
  <p class="k">Next step</p>
  <h1>Book a Consultation.</h1>
  <p class="lead">We will look at how AI engines describe your brand today, and what it would take to be named first. Or start with your AI Visibility Score.</p>
  <dl class="contact"><div><dt>Email</dt><dd>success@leadaio.com</dd></div><div><dt>Phone</dt><dd>(888) 778-4649</dd></div><div><dt>Hours</dt><dd>Monday to Friday, 8am to 5pm</dd></div></dl>
</div>''', 'bg-orbit', 'is-cover'))
assert n == TOTAL, n

CSS = open(os.path.join(ROOT, 'deck', 'deck.css')).read()
import base64
for f in ('bricolage-latin', 'archivo-latin', 'jetbrainsmono-latin'):
    data = base64.b64encode(open(os.path.join(ROOT, 'assets', 'fonts', f + '.woff2'), 'rb').read()).decode()
    CSS = CSS.replace(f'url(../assets/fonts/{f}.woff2)', f'url(data:font/woff2;base64,{data})')
out = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>LeadAIO · Deck</title>
<style>{CSS}</style></head><body>
{''.join(S)}</body></html>
'''
open(os.path.join(ROOT, 'deck', 'leadaio-deck.html'), 'w').write(out)
print('wrote deck/leadaio-deck.html,', n, 'slides')

if '--pdf' in sys.argv:
    subprocess.run(['node', '-e', '''
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + process.argv[1]); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.pdf({ path: process.argv[2], width: '1920px', height: '1080px', printBackground: true, pageRanges: '' });
  await b.close();
})();''', os.path.join(ROOT, 'deck', 'leadaio-deck.html'), os.path.join(ROOT, 'deck', 'LeadAIO-deck.pdf')], check=True)
    print('wrote deck/LeadAIO-deck.pdf')
