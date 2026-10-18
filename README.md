# LeadAIO website

Static marketing site for LeadAIO, a managed AI visibility agency. Black and gold. No build step.

```
index.html            the page
assets/css/site.css   styles (tokens at the top)
assets/js/site.js     reveals, the "type what your buyers ask" demo, live-chat hook
assets/fonts/         Anton and Work Sans, self-hosted (SIL Open Font License)
```

Open `index.html` in a browser, or serve the folder with any static host.

## Sections

1. **Hero**: "Be the answer", set across a black field and a gold field.
2. **Intro**: why AI answers quote Reddit, reviews and lists instead of brand sites.
3. **Programs**: AEO, Reddit and community growth, Google Autosuggest, reputation and removal, authority placements.
4. **Type what your buyers ask**: a live demo. Visitors type a buyer question and their brand, then see the AI answer LeadAIO works toward.
5. **How we start**: discovery call, placement plan, monitoring dashboard.
6. **FAQ**
7. **Contact**: success@leadaio.com, (888) 778-4649, Monday to Friday 8am to 5pm.

## Before launch

- **Example data.** The audit, placement plan and dashboard in "How we start" are labelled "Example account". Swap in real (anonymised) numbers if you have them. The Reddit thread and best-of list in the intro are illustrations.
- **Live chat.** "Start a live chat" calls `window.LeadAIOChat.open()` if a chat widget defines it, and otherwise opens an email. Wire your chat provider there.
- **Booking.** "Book a strategy call" opens an email with a prefilled subject. Replace it with your calendar link (Calendly, HubSpot and so on) if you have one.
- **Legal pages.** "Privacy policy" and "Terms" link to `#privacy` and `#terms`, which don't exist yet.
- **Proof.** There are no client logos, testimonials or results on the page, because none were supplied. Add real ones when you can share them.
- **Logo.** The wordmark is set in Anton. Replace it with the real logo file if there is one.
