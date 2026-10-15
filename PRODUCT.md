# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, server rendering so Telegram/Instagram link previews work) + Prisma ORM + Auth.js (email or Google). SQLite locally; PostgreSQL planned for production. Code is kept on GitHub; the production host is not decided yet, so nothing may assume a specific provider.

## Users

- **Hosts** (primary): ordinary people in Uzbekistan organizing a wedding (nikoh), fotiha, sunnat to‘y, yubiley or birthday. On a phone, in a few minutes, they build a digital invitation, send its link to guests (mainly through Telegram), and track who is coming.
- **Guests**: relatives, neighbours and colleagues of every age, including older people who read Cyrillic more easily than Latin. They open the link inside Telegram's in-app browser on a phone, read the invitation, find the venue, and answer RSVP.
- **Admin** (platform owner): turns `isPaid` on manually, enables/disables designs, watches overall stats.

## Product Purpose

A self-service platform for making beautiful digital invitations (taklifnoma). Success = a host publishes an invitation in minutes without help; guests open it, feel the occasion, reach the venue, and answer; the host sees an accurate head count.

## Positioning

The reference service (taklifchi.online) makes invitations to order. This platform lets the host make it themselves, with a live phone preview, per-guest personal links ("Hurmatli {ism}"), a Latin↔Cyrillic switch derived automatically from one text entry, and an RSVP dashboard with the total number of people. Every design is original, authored as lightweight SVG/CSS/Canvas graphics, not stock imagery or heavy video.

## Operating Context

- Uzbek language, Latin script for the platform UI; invitation text in the host's chosen script (lat/cyr), switchable for guests.
- Primary device: phone, opened from Telegram. Desktop is secondary.
- Event time zone: Asia/Tashkent (UTC+5, no DST).
- Occasion vocabulary per event type (nikoh, fotiha, sunnat, yubiley, tug‘ilgan kun, boshqa) — e.g. yubiley says "Tabrik uchun" instead of "To‘yona".
- Invitations traditionally carry a programme (kun tartibi), the venue (to‘yxona), notes (dress code, parking), and are signed by the hosting families.

## Capabilities and Constraints

- Template registry: each design is one self-contained module following a single contract (palette, fonts with full Latin + Cyrillic support, Opening component, SVG decor, section order, default texts per event type). Adding a design = adding one folder. Designs never hard-code invitation data.
- Public page `/i/{slug}`: opening screen (music starts only after that tap), hero, invitation text, date + countdown + add-to-calendar (.ics + Google Calendar), programme timeline, notes, venue + map links + copy address, gift, RSVP form, thanks (+ Telegram reply), closing. Empty sections are not rendered.
- Personal guest links `?g={token}`; invalid token falls back to the generic text silently (no error shown).
- Music library of 5–8 light tracks (files supplied later) with a persistent mute toggle.
- Security: owners see only their own data; the public page never exposes guest lists or other guests' answers; RSVP has honeypot, rate limiting, sanitizing, and length limits.
- Phases: 1) data + public renderer, 2) editor wizard + landing, 3) guests & RSVP dashboard, 4) admin, SEO, payments placeholder (Click/Payme).
- Undecided: what `isPaid=false` restricts (currently a small "Namuna" mark), pricing, production host, domain.

## Brand Commitments

- Every design must be visually richer than the reference service's designs, using original graphics only (never copied from the reference or the internet).
- Initial designs and their pinned worlds (from the owner's brief): **Maktub** (nikoh; cream, burgundy wax seal, gold lines; envelope opens when the seal is tapped), **Non** (fotiha; warm wheat/beige, brown; the bread breaks in two), **Shahzoda** (sunnat; ivory + blue/turquoise + gold, do‘ppi patterns; doves fly), **Chinor** (yubiley; autumn green-amber, plane-tree leaves, teapot & piyola; leaves fall), **Anor** (nikoh; pale pink, pomegranate red and green; the pomegranate opens).
- Light animation only (CSS/SVG/Canvas/Lottie, no heavy mp4); respect `prefers-reduced-motion`.

## Evidence on Hand

No real customers, testimonials, photos or music yet. Demo invitations use clearly synthetic sample data. Music files, OAuth keys, payment keys and the domain will be supplied by the owner later; nothing may be fabricated in their place.

## Product Principles

1. The guest's phone in Telegram is the stage: first screen fast, every control thumb-sized (≥44px), text ≥16px.
2. One entry, two scripts: hosts type once; Latin and Cyrillic both read correctly.
3. A design is a module, never a fork: the renderer depends only on the contract.
4. Honest states: every failure gets a clear Uzbek message; nothing is swallowed silently.
5. Guests' privacy first: nothing on the public page reveals other guests.

## Accessibility & Inclusion

Older guests: large readable text, high contrast on body copy, Cyrillic option. Touch targets ≥44px, reduced-motion support, keyboard focus visible.
