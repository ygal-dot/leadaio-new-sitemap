# LeadAIO website

Static marketing site for LeadAIO, a managed AI visibility agency for B2B SaaS. Black and gold. No build step.

```
index.html            home page
about.html, book.html, contact.html   inner pages
assets/css/site.css   styles (tokens at the top)
assets/js/site.js     flight path, answer feed, routing wires, telemetry chart, program tabs, mission meter, prompt filter, forms, live-chat hook
assets/fonts/         Bricolage Grotesque, Archivo and JetBrains Mono, self-hosted (SIL Open Font License)
```

Open `index.html` in a browser, or serve the folder with any static host.

## Sections

Home (`index.html`):

1. **Hero console:** "Launch your brand into AI answers." A gold flight path climbs from Unknown past Reddit threads, review sites and best-of lists to Named first, with a telemetry strip. Waypoints are clickable; "Replay launch" replays it.
2. **Sample logos** (marquee).
3. **Mission stages:** audit, placement plan, placements live, telemetry review.
4. **SEO vs AEO:** a five-row comparison table.
5. **Live answer feed:** a sample AI answer that names "Your brand" first, with its sources, per engine.
6. **Source routing:** five programs wired through LeadAIO to four engines.
7. **Inside each program:** tabs (arrow keys work) with what we do, what you get and what you approve.
8. **An example mission:** a sample payroll company week by week; the meter follows the week you are reading.
9. **Telemetry:** share of prompts per engine over 12 weeks.
10. **The prompts we track:** sample buyer prompts, filterable by intent.
11. **Who it is for / not the right fit.**
12. **Every month you get:** six deliverables and a call to action.
13. **FAQ** and **contact** (email, live chat, phone).

Inner pages: `about.html`, `book.html` (briefing form), `contact.html`.

Design system: `DESIGN.md`. Product brief: `PRODUCT.md`. Approved mockups: `.impeccable/mocks/`.

## Before launch

- **Example data.** The flight path, telemetry, answer feed, chart, example mission and sample prompts are labelled as examples. Swap in real (anonymised) numbers when you have them.
- **Sample logos.** The eight logos are fictional placeholders for the demo. Replace them with real client logos you have permission to show, or remove the strip.
- **Live chat.** "Start a live chat" calls `window.LeadAIOChat.open()` if a chat widget defines it, and otherwise opens an email. Wire your chat provider there.
- **Booking.** "Book a strategy call" opens an email with a prefilled subject. Replace it with your calendar link (Calendly, HubSpot and so on) if you have one.
- **Legal pages.** "Privacy policy" and "Terms" link to `#privacy` and `#terms`, which don't exist yet.
- **Logo.** The wordmark is set in Bricolage Grotesque with a small flight-path mark. Replace it with the real logo file if there is one.
