# LeadAIO website

Static marketing site for LeadAIO, a managed AI visibility agency for B2B SaaS. Black and gold. No build step.

```
index.html            the page
assets/css/site.css   styles (tokens at the top)
assets/js/site.js     flight path launch, answer feed tabs, routing wires, telemetry chart, live-chat hook
assets/fonts/         Bricolage Grotesque, Archivo and JetBrains Mono, self-hosted (SIL Open Font License)
```

Open `index.html` in a browser, or serve the folder with any static host.

## Sections

1. **Hero console:** "Launch your brand into AI answers." A gold flight path climbs from Unknown past Reddit threads, review sites and best-of lists to Named first, with a telemetry strip (prompts named, share per engine). Waypoints are clickable; "Replay launch" replays it.
2. **Mission stages:** audit, placement plan, placements live, telemetry review.
3. **Live answer feed:** a sample AI answer that names "Your brand" first, with its sources, per engine.
4. **Source routing (programs):** five programs wired through LeadAIO to four engines.
5. **Telemetry:** share of prompts per engine over 12 weeks.
6. **Sample logos**, **FAQ**, **contact** (email, live chat, phone).

Design system: `DESIGN.md`. Product brief: `PRODUCT.md`. Approved mockups: `.impeccable/mocks/`.

## Before launch

- **Example data.** The flight path, telemetry, answer feed and chart are labelled "Example data". Swap in real (anonymised) numbers when you have them.
- **Sample logos.** The eight logos are fictional placeholders for the demo. Replace them with real client logos you have permission to show, or remove the strip.
- **Live chat.** "Start a live chat" calls `window.LeadAIOChat.open()` if a chat widget defines it, and otherwise opens an email. Wire your chat provider there.
- **Booking.** "Book a strategy call" opens an email with a prefilled subject. Replace it with your calendar link (Calendly, HubSpot and so on) if you have one.
- **Legal pages.** "Privacy policy" and "Terms" link to `#privacy` and `#terms`, which don't exist yet.
- **Logo.** The wordmark is set in Bricolage Grotesque with a small flight-path mark. Replace it with the real logo file if there is one.
