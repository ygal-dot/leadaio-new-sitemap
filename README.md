# LeadAIO website

Static marketing site for LeadAIO, a managed AI visibility agency for B2B SaaS. Black and gold. No build step.

```
index.html            the page
assets/css/site.css   styles (tokens at the top)
assets/js/site.js     the live map, share-of-voice chart, reveals, live-chat hook
assets/fonts/         Archivo and JetBrains Mono, self-hosted (SIL Open Font License)
```

Open `index.html` in a browser, or serve the folder with any static host.

## Sections

1. **Hero:** "Move to the top-right of AI's shortlist." beside a live AI answer map. Visitors switch on placements (Reddit threads, review sites, best-of lists, publications, autosuggest) and watch their brand's dot move from "Invisible" to "Named first", with per-engine readouts.
2. **Sample logos** (fictional, labelled as samples).
3. **AI cites what others say about you:** citation share by source type.
4. **Programs:** evaluation table showing which axis each program moves.
5. **Monitoring:** share-of-voice chart and prompt positions per engine.
6. **From invisible to named first:** week 1, weeks 2 to 6, monthly.
7. **FAQ** and **contact** (email, live chat, phone).

Design system: `DESIGN.md`. Product brief: `PRODUCT.md`.

## Before launch

- **Example data.** The map, rivals, source shares and dashboard are labelled "Example data" or "Example account". Swap in real (anonymised) numbers when you have them.
- **Sample logos.** The eight logos are fictional placeholders for the demo. Replace them with real client logos you have permission to show, or remove the strip.
- **Live chat.** "Start a live chat" calls `window.LeadAIOChat.open()` if a chat widget defines it, and otherwise opens an email. Wire your chat provider there.
- **Booking.** "Book a strategy call" opens an email with a prefilled subject. Replace it with your calendar link (Calendly, HubSpot and so on) if you have one.
- **Legal pages.** "Privacy policy" and "Terms" link to `#privacy` and `#terms`, which don't exist yet.
- **Logo.** The wordmark is set in Archivo with a small map-axis mark. Replace it with the real logo file if there is one.
