# LeadAIO website

Static marketing site for LeadAIO, an AI visibility agency for mid-market brands. Black and gold (brand gold `#D6AE4B`). No build step.

Six pages, and every one sells the consultation:

| Page | File | Its job |
| --- | --- | --- |
| Home | `index.html` | Say what we do in five seconds |
| How it works | `how-it-works.html` | The method, so it isn't a black box |
| AI Visibility Score | `ai-visibility-score.html` | The entry offer: get your baseline |
| Who we serve | `who-we-serve.html` | Mid-market brands, by role |
| About | `about.html` | The partners and how we work |
| Book a consultation | `book.html` | A short form into Zoho, to Sivonne |

```
assets/css/site.css   styles (tokens at the top)
assets/js/site.js     flight path, radar, platform hub, reveals, forms (Zoho hand-off), live-chat hook
assets/img/           logo (leadaio-logo.png for the dark site, leadaio-logo-on-light.png for light backgrounds) and black-and-white background images
assets/fonts/         Bricolage Grotesque, Archivo and JetBrains Mono, self-hosted (SIL Open Font License)
```

Open `index.html` in a browser, or serve the folder with any static host.

## What each page holds

- **Home:** "Launch your brand into AI answers" hero with the flight path (Unknown, AI audit, Entity authority, Citations, Named first) and two actions: Book a consultation, Get your AI Visibility Score. Then three sourced industry figures (Ahrefs 2025, SparkToro & Datos 2024, Seer Interactive 2025; check them again before launch), three cards that lead to How it works, the Score and Who we serve, SEO vs AIO, a short FAQ, and the contact panel.
- **How it works:** then vs now, the four stages (Discovery and AI audit, Strategy and architecture, Launch and optimize, Scale and lead), AIO / GEO / AEO, the six disciplines, the platforms we optimize for, and what the client sees (score, blueprint, reporting, what moved it, QBRs, the plan ahead).
- **AI Visibility Score:** what the score is, the radar console with the six readings it covers, how you get it in four steps, and a short FAQ. Its buttons open the booking form with "My AI Visibility Score" already selected (`book.html?want=score`).
- **Who we serve:** six role cards (CEOs and founders, CMOs and VPs of marketing, growth and demand, SEO and content, brand and communications, sales), a good fit, and not the right fit.
- **About:** the partners, how we work (including quarterly business reviews), the LeadAIO difference and engine coverage.
- **Book a consultation:** name, work email, company, website and role, what they would like (consultation, score or both) and an optional note. Beside it: what happens next, email and phone.

## Before launch

- **Zoho.** The booking form has a `data-zoho=""` attribute in `book.html`. Paste the Zoho Forms or Zoho CRM web-to-lead URL there and rename the form fields to the names Zoho expects; the form then posts straight to Zoho, where leads route to Sivonne. Until then, submitting opens a prefilled email to success@leadaio.com.
- **Partners.** The About page has two placeholder cards (`[Partner name]`, `[Title]`, bio). Add the real names, titles, bios and photos, and add or remove cards to match.
- **Services.** Only AI Optimization (AIO / GEO / AEO) is on the site, as confirmed by Eric. Reddit, review sites, best-of lists, publications, Google Autosuggest and reputation management were removed. Add them back only once confirmed.
- **No examples, no pricing.** Sample logos, example stats, demo testimonials, case studies, example dashboards and any pricing were removed. The three industry figures on the home page are real, sourced numbers, not client results.
- **Reviews.** The site promises quarterly business reviews (QBRs), not monthly review calls.
- **AI engine logos.** ChatGPT, Claude, Perplexity and Gemini marks are from Simple Icons (CC0 vectors; the marks remain their owners' trademarks). Grok, Microsoft Copilot and Siri are neutral stand-ins; swap in approved files.
- **Live chat.** "Live chat" on the home page calls `window.LeadAIOChat.open()` if a chat widget defines it, and otherwise opens an email.
- **Legal pages.** "Privacy policy" and "Terms" link to `#privacy` and `#terms`, which don't exist yet.

Design system: `DESIGN.md`. Product brief: `PRODUCT.md`. Approved mockups: `.impeccable/mocks/`.
