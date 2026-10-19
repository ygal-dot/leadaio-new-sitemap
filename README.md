# LeadAIO website

Static marketing site for LeadAIO, a managed AI visibility agency for B2B SaaS. Black and gold. No build step.

```
index.html            home page
about.html, book.html, contact.html   inner pages
assets/css/site.css   styles (tokens at the top)
assets/js/site.js     flight path, answer feed, routing wires, telemetry chart, program tabs, mission meter, prompt filter, forms, live-chat hook
assets/img/           black-and-white background images (generated for LeadAIO): hero consoles, the case studies band, and a closing image behind the last section of each page
assets/fonts/         Bricolage Grotesque, Archivo and JetBrains Mono, self-hosted (SIL Open Font License)
```

Open `index.html` in a browser, or serve the folder with any static host.

## Sections

Home (`index.html`):

1. **Hero console:** "Launch your brand into AI answers." A gold flight path climbs from Unknown past Reddit threads, review sites and best-of lists to Named first, with a telemetry strip. Waypoints are clickable; "Replay launch" replays it.
2. **Sample logos** (marquee).
2b. **Be where AI knowledge is sourced:** three pillars (Distribution, Discoverability, Perception) as a dark card, a gold-framed card and a solid gold card, with line icons that draw in.
3. **Mission stages:** audit, placement plan, placements live, telemetry review.
4. **SEO vs AIO:** a five-row comparison table.
5. **Live answer feed:** a sample AI answer that names "Your brand" first, with its sources, per engine.
6. **Source routing:** five programs wired through LeadAIO to four engines.
7. **Inside each program:** tabs (arrow keys work) with what we do, what you get and what you approve.
8. **An example mission:** a sample payroll company week by week; the meter follows the week you are reading.
9. **Telemetry:** share of prompts per engine over 12 weeks.
9b. **Case studies:** three demo customers (Paylark, Ledgerly, Opsmint) with before/after prompts named, a weekly trend line and what moved it. Swipe row on phones.
10. **The prompts we track:** sample buyer prompts, filterable by intent.
11. **Who it is for / not the right fit.**
12. **Every month you get:** six deliverables and a call to action.
13. **FAQ** and **contact** (email, live chat, phone).

Inner pages: `about.html`, `book.html` (briefing form), `contact.html`.

Responsive: desktop above 1100px; tablets 761 to 1100px (stacked sections, hero path below the headline under 900px, menu button under 900px); phones up to 760px (mission stages and monthly deliverables become swipe rows, the example-mission meter sticks under the header). Every page opens at the top unless the link targets a section.

Design system: `DESIGN.md`. Product brief: `PRODUCT.md`. Approved mockups: `.impeccable/mocks/`.

## Before launch

- **Example data.** The hero flight path and telemetry strip are no longer tagged (by request); the footer note still covers them. The answer feed, chart, example mission and sample prompts are labelled as examples. Swap in real (anonymised) numbers when you have them.
- **Case studies.** The three customers are fictional demo brands with example figures. Replace them with real, approved case studies before launch.
- **AI engine logos.** The hero row uses the ChatGPT (OpenAI), Claude, Perplexity and Gemini marks from Simple Icons (CC0 vectors; the marks remain their owners' trademarks). The Grok mark is a simple stand-in drawn for this site: swap in the official file from xAI before launch.
- **Sample logos.** The eight logos are fictional placeholders for the demo. Replace them with real client logos you have permission to show, or remove the strip.
- **Live chat.** "Start a live chat" calls `window.LeadAIOChat.open()` if a chat widget defines it, and otherwise opens an email. Wire your chat provider there.
- **Booking.** "Book a call" opens an email with a prefilled subject. Replace it with your calendar link (Calendly, HubSpot and so on) if you have one.
- **Legal pages.** "Privacy policy" and "Terms" link to `#privacy` and `#terms`, which don't exist yet.
- **Logo.** The wordmark is set in Bricolage Grotesque with a small flight-path mark. Replace it with the real logo file if there is one.
