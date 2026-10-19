---
name: LeadAIO
description: Mission control for a brand's launch into AI answers. Black console, gold flight path.
colors:
  bg: "#090909"
  panel: "#0e0e0d"
  panel-2: "#151513"
  rule: "#3a3220"
  rule-strong: "#5a4a28"
  ink: "#f4f1ea"
  muted: "#a8a59e"
  dim: "#8c887f"
  gold: "#f2c14e"
  gold-hi: "#f7d27a"
  on-gold: "#0b0a07"
  live: "#5fd38a"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 1.5rem + 3.4vw, 4.6rem)"
    fontWeight: 720
    lineHeight: 1
    letterSpacing: "-0.022em"
  heading:
    fontFamily: "Bricolage Grotesque, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.3rem + 2.4vw, 3.4rem)"
    fontWeight: 720
    lineHeight: 1.02
    letterSpacing: "-0.022em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  tag: "4px"
  control: "6px"
  panel: "8px"
  pill: "999px"
spacing:
  margin: "clamp(1rem, 2.4vw, 2.5rem)"
  section: "clamp(6rem, 11vw, 10rem)"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.on-gold}"
    rounded: "{rounded.control}"
    padding: "0 1.5rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.gold-hi}"
  tag:
    textColor: "{colors.gold}"
    rounded: "{rounded.tag}"
    padding: "0.2rem 0.55rem"
  tab-selected:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.on-gold}"
    rounded: "{rounded.pill}"
---

# Design System: LeadAIO

## Overview

The site is a mission-control console for a brand's launch into AI answers. The first screen is one bracketed console: a faint plotting grid, a gold flight path that climbs from Unknown past Reddit threads, review sites and best-of lists to the orbit Named first, and a telemetry strip of per-engine values below it. Every later section is another console panel: mission stages, a live answer feed, source routing, telemetry, contact. Gold always means the brand's own trajectory, live values or the action.

Approved comp: `.impeccable/mocks/comp-1.png` (first viewport); section reference `.impeccable/mocks/comp-3.png`.

## Colors

### Primary
- **Flight gold** `#f2c14e`: the flight path, the brand marker and orbit, live values, tabs and the action. Hover `#f7d27a`.

### Neutral
- **Console black** `#090909` ground; **panel** `#0e0e0d` and **panel-2** `#151513` for raised surfaces.
- **Instrument rules** `#3a3220` (quiet) and `#5a4a28` (frames, corner brackets, dividers): dark gold, never grey.
- **Ink** `#f4f1ea`, **muted** `#a8a59e`, **dim** `#8c887f`.
- **Live** `#5fd38a`: the one status light on the answer feed. Static, never pulsing.

### Named Rules
- **The trajectory rule:** gold is the brand's path and the action. Rivals, grids and frames stay in the dark-gold rules.
- **The sample rule:** every synthetic figure carries an "Example data" tag; demo answers use the placeholder "Your brand", never a real company.

## Typography

Bricolage Grotesque (user's choice) for titles and the wordmark, Archivo for running text, JetBrains Mono for navigation, coordinates, labels and every number.

## Layout

A 96rem frame. The hero console is 34rem tall at desktop so the telemetry strip and the top of Mission stages sit inside the first viewport, as in the comp. Panels separate by `clamp(6rem, 11vw, 10rem)`. On phones the flight path becomes its own 22rem block under the headline.

## Elevation & Depth

No shadows except the soft gold halo around the brand marker. Depth is the console frame, corner brackets and the panel tone step.

## Shapes

Small radii only: 4px tags, 6px controls and cards, 8px interface panels, pills for engine tabs. Circles are data: waypoints (hollow rings that light gold as the marker passes), the marker, the orbit.

## Components

- **Console:** bracketed frame with four corner marks and a faint grid; holds the flight path.
- **Flight path:** SVG path drawn up to the marker each frame; waypoint labels are buttons that fly the marker to their stage and update telemetry; "Replay launch".
- **Telemetry strip:** label cell plus five mono readouts with dividers.
- **Answer feed:** prompt field, engine tabs, answer with the brand in gold, three sources.
- **Source routing:** five program cards wired to the LeadAIO hub and out to four engines, with gold flow on the wires.

## Do's and Don'ts

### Do:
- Keep gold for the brand's trajectory, live values and the action.
- Use mono for every number and coordinate.
- Label all demo figures "Example data".

### Don't:
- Add eyebrows, glows, planets, stars or pulsing dots.
- Show real company names in demo answers.
- Use grey for instrument lines; they are dark gold.
