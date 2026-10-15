---
name: Taklifnoma
description: Self-service digital invitations; one shared template contract, one visual world per template.
colors:
  maktub-paper: "#f4ecdd"
  maktub-card: "#faf5ea"
  maktub-ink: "#2b1b16"
  maktub-ink-soft: "#5e4a40"
  maktub-wax: "#7a1426"
  maktub-wax-deep: "#4a0a16"
  maktub-wax-hover: "#8a1a2e"
  maktub-on-wax: "#fbf3e4"
  maktub-gold: "#a57c34"
  maktub-gold-ink: "#7a5a1f"
  maktub-gold-light: "#d9bc78"
  maktub-velvet: "#3a0a14"
  maktub-velvet-deep: "#22050b"
  maktub-liner: "#5a0f1d"
  maktub-error: "#9a1428"
  maktub-success: "#2f5a2a"
typography:
  base-body:
    fontFamily: "serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  maktub-display:
    fontFamily: "Great Vibes, cursive"
    fontSize: "clamp(60px, 20cqi, 96px)"
    fontWeight: 400
    lineHeight: 0.98
  maktub-display-cyrl:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(48px, 15cqi, 76px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  maktub-headline:
    fontFamily: "Great Vibes, cursive"
    fontSize: "54px"
    fontWeight: 400
    lineHeight: 1.1
  maktub-headline-cyrl:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  maktub-numeral:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "112px"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "\"lnum\""
  maktub-body:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.72
  maktub-title:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.35
  maktub-label:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.2em"
  maktub-button:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  hairline: "2px"
  sm: "3px"
  focus: "4px"
  pill: "999px"
  circle: "50%"
spacing:
  gutter: "clamp(22px, 7vw, 56px)"
  section: "64px"
  maktub-section: "72px"
  maktub-divider: "64px"
  title-gap: "22px"
  stack-sm: "10px"
  stack-md: "24px"
  stack-lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.maktub-wax}"
    textColor: "{colors.maktub-on-wax}"
    typography: "{typography.maktub-button}"
    rounded: "{rounded.sm}"
    padding: "10px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.maktub-wax-hover}"
    textColor: "{colors.maktub-on-wax}"
  button-line:
    textColor: "{colors.maktub-ink}"
    typography: "{typography.maktub-button}"
    rounded: "{rounded.sm}"
    padding: "10px 22px"
    height: "48px"
  button-ghost:
    textColor: "{colors.maktub-wax}"
    typography: "{typography.maktub-button}"
    rounded: "{rounded.sm}"
    padding: "10px 22px"
    height: "48px"
  input-underline:
    textColor: "{colors.maktub-ink}"
    typography: "{typography.maktub-body}"
    padding: "10px 2px"
    height: "48px"
  script-toggle:
    textColor: "{colors.maktub-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
    height: "44px"
  script-toggle-active:
    backgroundColor: "{colors.maktub-wax}"
    textColor: "{colors.maktub-on-wax}"
    rounded: "{rounded.pill}"
  music-button:
    backgroundColor: "{colors.maktub-card}"
    textColor: "{colors.maktub-wax}"
    rounded: "{rounded.circle}"
    size: "44px"
  stepper-button:
    textColor: "{colors.maktub-wax}"
    rounded: "{rounded.circle}"
    size: "48px"
  gift-card:
    backgroundColor: "{colors.maktub-card}"
    textColor: "{colors.maktub-ink}"
    rounded: "{rounded.hairline}"
    padding: "18px 16px 16px"
  rsvp-card:
    backgroundColor: "{colors.maktub-card}"
    textColor: "{colors.maktub-ink}"
    padding: "40px 24px 32px"
---

# Design System: Taklifnoma

## Overview

**Creative North Star: "One Contract, Many Letters"**

Taklifnoma is two layers. The durable layer is the shared template system: one TypeScript contract (`src/templates/contract.ts`), one renderer (`InvitationRenderer`), one structural stylesheet (`invitation.css`) that reads only `--inv-*` custom properties, and one fixed section anatomy that every template restyles through `.inv-*` class hooks. Nothing in that layer carries a colour, a typeface or an ornament of its own; it carries structure, the accessibility floor, the script handling and the opening hand-off. The second layer is a template world: a self-contained folder that supplies palette, fonts, an Opening scene, an SVG decor set and a CSS module scoped under its root class. Adding a design means adding one folder and one line in each of the two lists in `registry.ts`.

The first and so far only shipped world is **Maktub**. Its thesis, as built: *the phone is the letter.* The guest breaks a lit wax seal on a cream envelope lying on burgundy velvet, the flap swings back onto a gold-latticed liner, and the sheet that rises out of the envelope is the page itself, one continuous laid-paper letter read top to bottom. Gold is foil and appears as hairlines; burgundy is wax and ink; everything else is paper. Future worlds (Non, Shahzoda, Chinor, Anor) get their own sections in this file with their own palette prefix; none of them inherit Maktub's surface decisions.

**Platform UI (landing, editor, dashboard, admin): world undecided.** No tokens, type or components exist for it yet. Do not reuse a template world (Maktub included) as the platform's look by default; that decision is still open.

**Key Characteristics:**
- Phone-first single column: one sheet, max 560px, centred on a template-owned ground.
- Templates restyle; they never fork the renderer or hard-code invitation data.
- Text ≥16px, every target ≥44px, visible focus, motion gated on the user's preference.
- Latin and Cyrillic both read correctly from one entry; display faces are checked per script.
- All decor is original inline SVG and CSS; the only raster is a host-supplied photo.
- Maktub: laid cream paper, burgundy wax, foil-gold hairlines, girih stars, burgundy velvet ground.

## Colors

The shared layer owns colour *roles*, not colours: each template's `meta.ts` palette is mapped by the renderer onto seven custom properties on the root element, and the structural CSS reads only those.

### Shared roles (contract `Palette` → `--inv-*`)
- **bg → `--inv-bg`**: the sheet (paper) colour. Also the text colour of the sample badge and of text selection.
- **surface → `--inv-surface`**: cards and forms.
- **text → `--inv-text`**: body copy; also the sample badge fill.
- **accent → `--inv-accent`**: focus outline, selection background, choice focus ring.
- **accent2 → `--inv-accent2`**: ornament and rule colour.
- **muted → `--inv-muted`** (optional, falls back to text): secondary text; the contract requires ≥4.5:1 on bg.
- **ground → `--inv-ground`** (optional, falls back to bg): the environment around the sheet on wide screens and behind it everywhere.
- **themeColor** (meta, not a custom property): the Telegram/browser chrome colour.

**The Roles-Not-Values Rule.** `invitation.css` never names a colour. A template sets its palette in `meta.ts`; anything finer (wax hover, gold-ink, error ink) lives in the template's own CSS module under its own prefix.

### Maktub: Primary
- **Sealing Wax Burgundy** (`maktub-wax`): section titles, the date numeral, programme times, the drop-cap, the primary button, the active script pill, the hand-drawn day ring, stamp and seal bodies. The one saturated colour on the paper.
- **Pressed Wax** (`maktub-wax-deep`): the shadow end of the wax; the brief's seal gradient runs wax to this.
- **Warm Wax** (`maktub-wax-hover`): primary-button hover only.
- **Wax Lettering** (`maktub-on-wax`): text on wax fills (primary button, active script pill).

### Maktub: Secondary
- **Foil Gold** (`maktub-gold`): hairlines only: envelope and flap rules, corner scrolls, dividers, the emblem, the programme thread, countdown separators, button and card borders (at 0.55–0.8 alpha), plus the ornamental ampersand and date dots. Never running text.
- **Gold Ink** (`maktub-gold-ink`): the readable gold. Calendar caption and RSVP field labels in Forum capitals (about 5.8:1 on card).
- **Pale Foil** (`maktub-gold-light`): gold on burgundy: the khatam lattice on the liner, the seal pulse ring, the opening hint text, the seal focus outline, the inner rule on the primary button (at 0.55 alpha).

### Maktub: Neutral
- **Laid Paper** (`maktub-paper`): the sheet, under chain lines (34px vertical repeat), faint horizontal laid lines (4px), fibre and noise turbulence, a lit top and a browned vignette.
- **Card Stock** (`maktub-card`): the RSVP reply card, the gift card, the photo mount, the floating controls (at 0.94 alpha).
- **Ink** (`maktub-ink`): body text, names, numerals, input text.
- **Faded Ink** (`maktub-ink-soft`): weekday, time line, countdown labels, hosts' signature, programme descriptions, venue address, the scroll cue (about 7:1 on paper).
- **Velvet** (`maktub-velvet`) and **Deep Velvet** (`maktub-velvet-deep`): the ground. A radial gradient from #5b1424 at the top through velvet to deep velvet, with noise; deep velvet is also the `html` background and scrollbar track, velvet is the theme colour.
- **Liner Burgundy** (`maktub-liner`): the field under the gold khatam lattice inside the envelope and on the flap's back.
- **Error Ink** (`maktub-error`): field and form errors, italic, with a 1px left rule on a 6% wash.
- **Copied Green** (`maktub-success`): the copy button's confirmed state only.

### Named Rules
**The Foil Is a Line Rule.** Foil gold draws lines, borders and small ornaments. Any gold you must read as words uses Gold Ink on paper or Pale Foil on velvet.

**The One Wax Rule.** Burgundy is the only saturated hue on the paper. Green appears only in the momentary "copied" state.

## Typography

**Shared layer:** three role variables, `--inv-font-heading`, `--inv-font-body`, `--inv-font-label` (label falls back to body), set by the template root class. Base text is 18px / 1.6 on the root; the minimum anywhere is 16px. Numbers use `lining-nums tabular-nums` (hero date, calendar, countdown, programme times, stepper, card numbers). Titles use `text-wrap: balance`; invitation paragraphs use `text-wrap: pretty` and `hyphens: auto`.

**Maktub Display Font:** Great Vibes (with cursive), Latin only
**Maktub Body Font:** EB Garamond 400/500/600, roman and italic (with Georgia, serif)
**Maktub Label Font:** Forum (with Georgia, serif)

All three load through `next/font` with latin, latin-ext, cyrillic and cyrillic-ext subsets and `display: swap`.

**Character:** a copperplate hand for names and titles over an old-style book serif for the letter, with engraved Roman capitals for small labels. Handwriting for the people, print for the facts.

### Hierarchy (Maktub)
- **Display** (Great Vibes 400, `clamp(60px, 20cqi, 96px)`, 0.98): the couple's names in the hero, stacked with a gold ampersand at 0.5em. Long names step down to `clamp(46px, 14.5cqi, 78px)`. Container units come from the hero, which is an inline-size container.
- **Headline** (Great Vibes 400, 54px, 1.1, wax): section titles. The RSVP title is 50px; the closing line is 46px; the greeting and countdown state are 40px; the closing names are 40px in ink.
- **Numeral** (EB Garamond 400, 112px, 1, wax): the day of the month in the date section. Hero date 30px with 0.1em tracking; countdown numbers 46px; stepper 28px.
- **Title** (EB Garamond 600, 19px, 1.35): programme item titles; venue name is 25px / 1.25.
- **Body** (EB Garamond 400, 19px, 1.72): the invitation letter, notes (1.55), gift text (1.65). Inputs are 20px. Italic EB Garamond carries the hosts' signature, month, RSVP lead, programme descriptions, placeholders and errors.
- **Label** (Forum 400, 16px, uppercase, tracked 0.14–0.24em): occasion name, weekday, calendar caption, field labels, countdown labels (0.04em), scroll cue, envelope "HURMATLI" line and opening hint.

### Named Rules
**The Script-Checked Display Rule.** A display face is used only in the scripts it fully covers. Great Vibes lacks Ғ Қ Ҳ, so under `:lang(uz-Cyrl)` Maktub swaps `--inv-font-heading` to EB Garamond italic (-0.01em) at fixed Cyrillic sizes (names `clamp(48px, 15cqi, 76px)` / 1.04, titles 44px, greeting 32px, closing 38px), and the envelope name goes italic through `--mk-address-style`. The monogram keeps Great Vibes and falls back per glyph to EB Garamond.

**The Readable Apostrophe Rule.** Calligraphic faces draw o‘, g‘ and the tutuq belgisi too small or not at all. The shared `apos()` helper wraps ‘ ’ ʻ ʼ ' in `.inv-apos`; every template must style that hook. Maktub sets it in the body face, upright, at 0.6em with 0.03em side margins. Wrap every display string (names, titles, greeting, closing, guest name) with `apos()`.

## Layout

**Shared layer.** One centred sheet (`max-width: 560px`) on a full-height ground, horizontal gutter `clamp(22px, 7vw, 56px)`, bottom padding 96px plus the safe-area inset so the fixed controls never cover the last line. Sections stack in `sectionOrder` with 64px top padding and a decor divider 56px below their content. Each section is `section.inv-section.inv-section--{id}[data-section]` with an `h2.inv-title`; the hero is the only `h1` and fills `100svh`. Sections with no data are not rendered. Running text aligns left inside centred sections (invite letter, programme, notes, RSVP form); titles, dates and closing are centred. Constrained inner columns: calendar, map actions and calendar menu 340px; programme and notes 420px; RSVP and gift 440px.

Section anatomy and hooks (fixed order): **hero** (`__emblem`, `__names`, `__name`, `__amp`, `__event`, `__date`, `__dot`, `__scroll`, `__thread`) → **invite** (`__greeting`, `__text`, `__text--lead`, `__hosts`, optional `.inv-photo`) → **date** (`__weekday`, `__day`, `__month`, `__time`, `.inv-cal` month table with `__mark`/`__ring` on the event day, `.inv-countdown` with `__cell`/`__num`/`__label`/`__sep`/`__state`, `.inv-calendar-add` for Google Calendar and .ics) → **program** (`ol.inv-program`, items as a 64px / 20px / 1fr grid: time, node, body) → **notes** (`ul.inv-notes`, 20px bullet column) → **venue** (`__art` or photo, `__name`, `__address`, `__actions`) → **gift** (`__text`, `__card`, `__number`) → **rsvp** (form or `--done`) → **closing** (`__text`, `__names`, `__hosts`, `__emblem`). Four `.inv-corner` instances (tl, tr, bl, br) draw one Corner component mirrored by transform.

**Maktub.** Sections open at 72px, the hero at 104px, dividers sit 64px down at `min(240px, 70%)`. Below 600px the sheet is edge to edge on velvet; from 600px the ground gains 56px / 24px / 72px padding and the sheet floats as a single page with a drop shadow. Corners are `clamp(72px, 20vw, 104px)` inset 12px.

## Elevation & Depth

**Shared layer:** flat. The only structural depth is z-order: opening overlay 50, sample badge 55, controls 60.

**Maktub:** physical, not interface, depth. Shadows exist only where a real object lies on another (a page on velvet, a print on a page, a card on a page, an envelope on velvet), and they are warm, wide and low. Paper relief comes from gradients and SVG turbulence, the wax from an SVG specular-lighting filter lit from the upper left.

### Shadow Vocabulary (Maktub)
- **Page on velvet** (`0 40px 80px rgb(10 0 3 / 0.55), 0 3px 8px rgb(10 0 3 / 0.4)`): the sheet, ≥600px only.
- **Envelope on velvet** (`0 26px 44px rgb(18 0 4 / 0.55), 0 4px 10px rgb(18 0 4 / 0.35)`): the envelope body during the opening.
- **Card on page** (`0 18px 36px rgb(60 20 10 / 0.14), 0 2px 5px rgb(60 20 10 / 0.08)`): the RSVP reply card.
- **Print on page** (`0 12px 24px rgb(60 20 10 / 0.16), 0 2px 4px rgb(60 20 10 / 0.12)`): host photo, mounted with dark photo corners and rotated -1.2deg.
- **Floating control** (`0 4px 12px rgb(20 0 4 / 0.25)`): script switch and music button.

### Named Rules
**The Objects-Only Shadow Rule.** A Maktub shadow means a paper object resting on something. Buttons, inputs and labels stay flat on the paper.

## Shapes

**Shared layer:** square by default. The structural CSS rounds only the focus outline (4px), the script switch and sample badge (pill) and the stepper and music buttons (circle). Inputs are explicitly `border-radius: 0`.

**Maktub:** near-square paper. Buttons, checkboxes and the envelope body take a 3px corner; the gift card 2px. Frames are double: a 1px gold border plus a 1px gold outline inset 5–8px (primary button, gift card, RSVP card), echoing the double gold rule on the envelope and flap. Recurring geometry: the 8-point girih star (divider centre, note bullets, emblem, khatam lattice), 45deg-rotated squares (programme nodes, the thread's drip), islimi scroll corners, an irregular wax outline. The RSVP card carries two fold creases at one-third and two-thirds; the wishes textarea is ruled at 32px.

## Components

### Buttons
Flat, quiet, letter-like; the wax ribbon is reserved for the act that matters.
- **Shape:** gently squared (3px), min height 48px, padding 10px 22px, 17px body face, 10px icon gap; press nudges down 1px; disabled at 0.6 opacity.
- **Primary (solid):** Sealing Wax fill, Wax Lettering text, a Pale Foil hairline inset 5px. Used for RSVP submit and the post-reply Telegram action. Hover warms to Warm Wax.
- **Map actions:** the solid class inside the venue actions is re-drawn as a secondary: transparent, wax text, gold border at 0.75. Hover gives a 6% wax wash and a wax border.
- **Line / Ghost:** card stock at 0.55 with gold border at 0.75; line uses ink text, ghost uses wax text (add-to-calendar trigger). Same hover as map actions.
- **States:** copy button shows Copied Green text and border when `data-state="copied"`, wax when `failed`; its label is `aria-live="polite"`.
- **Focus:** shared 2px accent outline, 3px offset, 4px radius.

### Inputs / Fields
- **Style:** writing on the line: transparent, no box, a 1px ink underline at 0.4, 20px text, wax caret, italic placeholder (#7a685e), min height 48px.
- **Focus:** underline turns wax and doubles with a 1px wax shadow.
- **Textarea:** ruled lines every 32px instead of an underline; rules turn wax at 0.45 on focus; min height 112px.
- **Labels:** Forum capitals, Gold Ink, 0.14em tracking.
- **Choice (attending):** a native radio hidden behind a 28px box (1.5px ink border, 3px corner); selection draws a wax check stroke (stroke-dashoffset, 0.35s); row min height 52px; focus ring on the row.
- **Stepper:** 48px circles with a gold border and wax glyphs around a 28px count.
- **Error:** italic Error Ink, 16px, `role="alert"`; the form error adds a left rule and a wash.

### Controls (shared)
- **Script switch:** a pill group (`role="group"`, `aria-pressed` buttons "Lotin" / "Кирилл"), each ≥44px tall and ≥48px wide, 16px text. Maktub fills it with card stock at 0.94 and a gold border; the active option becomes a wax pill.
- **Music:** 44px circle, shown only once the opening has been tapped and the file can play; it breathes (scale 1.08, 2.8s) while playing if motion is on.
- **Placement:** top-right while sealed; after opening it moves to bottom-right above the safe area, hides on scroll-down (translate and fade) and returns on scroll-up, near the top, or at the page end.

### Cards / Containers (Maktub)
- **Reply card (RSVP):** card stock with paper texture and two fold creases, gold border plus inset gold outline at 8px, card-on-page shadow, padding 40px 24px 32px. After sending it becomes the thank-you letter with the wax stamp.
- **Gift card:** card stock, 2px corner, gold border plus outline inset 6px, padding 18px 16px 16px; the card number is 23px, tracked 0.08em, grouped by fours, never wrapping.

### Opening hand-off (shared contract)
The renderer owns a three-phase state: `sealed` → `opening` → `open`. While not open, the document cannot scroll and the sheet is `inert`. The template's `Opening` receives `onOpen` (call on the guest's tap: music starts only here, and the guest-opened beacon fires) and `onDone` (call when the scene ends; the overlay unmounts). It also receives `reducedMotion` and must offer a short, motionless path. The root carries `data-phase`, and `data-motion="on"` only after mount and only without reduced motion, so every decorative animation keys off that attribute.

### Signature: Maktub opening (envelope and seal)
- **First view:** a 5:7 portrait envelope, `min(84vw, 400px, (100svh - 220px) × 5/7)`, on velvet under a warm radial light. Wax seal at 30% of the envelope width on the flap tip, with a Pale Foil pulse ring (2.6s, scale 0.96 → 1.45). "HURMATLI" in Forum and the guest's name in Great Vibes at 11cqi on the lower flap; the hint below in Pale Foil capitals. The seal is the button (`aria-label` = the hint); the whole envelope is also clickable.
- **Timeline (ms after the tap):** press (seal 0.93) → crack at 140 (gold light-leak along the crack, halves part) → open at 560 (halves fall away, flap rotates 180deg on X to show the khatam liner, envelope drops 27%) → rise at 1300 (the letter climbs 60% of the envelope height) → out at 2250 (envelope parts fall and fade, the letter flies to the real sheet's position at scale 1) → done at 3200.
- **The letter is the page:** the rising letter is a live clone of the hero inside `.inv-sheet[data-clone]`, measured against the real sheet, so when the overlay unmounts the page is already in the same place.
- **Reduced motion:** the tap goes straight to `out`, the stage fades in 0.35s with all transforms off, done at 420ms; the pulse is static at 0.6.

### Signature: Maktub ink-and-wax motion
- **Day ring:** a hand-drawn wax ring around the event day draws itself (1.15s) when the calendar enters view.
- **Programme thread:** the gold thread grows down the margin (1.6s) and items settle 8px with a 70ms stagger; nodes are gold-edged diamonds with a wax core.
- **Hero thread:** the scroll cue's gold thread drips in on a 2.8s loop with a wax drop at its end.
- **Stamp:** a fresh RSVP presses the wax seal stamp onto the card (0.75s, from 1.9× and -24deg to 1× at -9deg, with overshoot).

## Do's and Don'ts

### Do:
- **Do** add a template as one folder (`meta.ts`, `index.tsx`, fonts, Opening, decor, CSS module) plus one line in each list in `registry.ts`; restyle through `:global(.inv-…)` under the template root class.
- **Do** keep every text size at 16px or above and every interactive target at 44px or above (buttons and inputs 48px, choice rows 52px).
- **Do** gate decorative animation on `[data-motion="on"]`, give `Opening` a motionless path for `reducedMotion`, and keep the shared reduced-motion override intact.
- **Do** verify each display face against both scripts and add a `:lang(uz-Cyrl)` swap when it lacks Ғ Қ Ҳ or Ў.
- **Do** style `.inv-apos` in every template and pass every display string through `apos()`.
- **Do** draw ornament as inline SVG sharing one `Defs` set; frame host photos as physical prints.
- **Do** in Maktub, keep gold to hairlines and small ornaments and use Gold Ink for gold words.
- **Do** in Maktub, keep motion to ink and wax: rings draw, threads grow, seals crack, stamps press.

### Don't:
- **Don't** hard-code invitation text or data inside a template; everything arrives through `TextView` and the dictionary.
- **Don't** fork or edit the renderer to get a template's look; override a section through `sections` in the definition only when restyling cannot do it.
- **Don't** start music, or anything audible, before the guest's tap on the Opening.
- **Don't** set Great Vibes on Cyrillic text.
- **Don't** add generic per-section fade-ins in Maktub; motion belongs to the object it animates.
- **Don't** use stock imagery, raster decor or video; host photos are the only raster.
- **Don't** put tracked capitals above a title as an invented kicker; Forum capitals label real content (occasion, weekday, field names, captions).
- **Don't** carry Maktub's palette, fonts or ornaments into another template or into the platform UI.
