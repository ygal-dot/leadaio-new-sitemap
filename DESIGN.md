---
name: LeadAIO
description: The AI answer map. Black plot field, gold data.
colors:
  bg: "#08080a"
  panel: "#0f0f12"
  panel-2: "#16161b"
  ink: "#eceae4"
  muted: "#a7a399"
  dim: "#8b877d"
  gold: "#d4af37"
  gold-hi: "#e9c75b"
  on-gold: "#0b0a08"
  rival: "#8d897f"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.4rem + 3.6vw, 4.6rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  heading:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.3rem + 2.6vw, 3.5rem)"
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.02rem + 0.45vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.55
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: "0px"
  dot: "50%"
spacing:
  margin: "clamp(1rem, 3vw, 3rem)"
  section: "clamp(6rem, 11vw, 10rem)"
  panel: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.on-gold}"
    rounded: "{rounded.none}"
    padding: "0 1.4rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.gold-hi}"
  button-line:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 1.4rem"
    height: "3rem"
  switch-on:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.gold}"
    rounded: "{rounded.none}"
    height: "2.25rem"
---

# Design System: LeadAIO

## Overview

LeadAIO's site is an instrument, not a brochure. The page is built on the 2x2 market map every B2B marketer knows from analyst reports: one axis for how often AI names a brand, one for how often it cites sources about the brand. The visitor's dot starts bottom-left and travels to the top-right as placements switch on. Everything else on the page reads as the same instrument: thin measurement lines, coordinates in tabular figures, square panels, and gold reserved for the brand's own data and the action.

## Colors

### Primary
- **Gold** `#d4af37`: the brand's dot, its trail, positive positions, and the primary action. Never decoration. Hover is `#e9c75b`.

### Neutral
- **Plot black** `#08080a` is the page ground; **panel** `#0f0f12` and **panel-2** `#16161b` step surfaces up.
- **Ink** `#eceae4` for text, **muted** `#a7a399` for secondary text, **dim** `#8b877d` for axis labels and captions (passes 4.5:1 on both grounds).
- **Rival grey** `#8d897f` draws other brands as hollow points.

### Named Rules
- **The data rule:** gold marks what belongs to the visitor's brand. Rivals, grids and chrome stay in the neutrals.
- **The sample rule:** any synthetic figure carries a visible "Example data" or "Example account" tag in gold outline.

## Typography

Archivo is the one voice, with its width axis: display and headings at `font-stretch: 112%`, body at 100%. JetBrains Mono is used only for data: coordinates, percentages, counts, the map tags.

### Hierarchy
- Display (h1), heading (h2), lead, body, small (0.875rem), data.
- Headings stay at two or three lines; body measure 34 to 68ch.

## Layout

A 88rem max frame with fluid side margins. Sections are separated by `clamp(6rem, 11vw, 10rem)`. Each section has its own composition: hero split 38/62 (copy, live map), sources split 5/7, a full-width evaluation table, a panel-ground monitoring band, a three-stop path, a FAQ list, contact channels, footer.

## Elevation & Depth

No shadows. Depth is a tone step (bg to panel to panel-2) and 1px instrument lines at 13% and 28% ink.

## Shapes

Square corners everywhere. Circles are reserved for data points and switch indicators.

## Components

### Buttons
Primary: gold fill, black text, square, 3rem tall. Secondary: 1px line, ink text, turns gold on hover.

### Switches
Placement toggles are `aria-pressed` buttons with a ring indicator that fills gold when on.

### Map (signature component)
SVG plot with a 10-unit grid, dashed gold midlines, quadrant names, hollow rival points, a gold "your brand" dot with a pinging ring, dashed trail and crosshair, a legend, a switchboard and a five-cell readout. Marked `data-ui`.

### Tables
The programs evaluation table and the dashboard prompt table use 1px row rules; the dashboard table scrolls inside its panel on phones.

## Do's and Don'ts

### Do:
- Show the mechanism with data (example data labelled as such).
- Keep gold for the brand's data and the action.
- Use mono only for numbers and measurements.

### Don't:
- Add eyebrows or kickers above headings.
- Add shadows, glows, gradients or glass.
- Present sample logos, rivals or figures as real.
