# NB Student Hub

> **Know your options. Plan your future.**
>
> A student guidance platform for South African matric and tertiary learners — course matching, eligibility, funding, applications, wellness and more.

Built for the **FNB App of the Year 2026 — Access to Higher Education** challenge.

---

## What it does

NB Student Hub answers the questions every SA learner faces after matric:

| Question | Where |
|---|---|
| **What can I study?** | Course Finder — matches 72 courses across 16 institutions against the learner's subjects, marks and stream |
| **Do I qualify?** | APS + subject-level eligibility engine with a transparent breakdown |
| **Where can I study?** | 16 institutions across University / University of Technology / TVET / Private College tiers |
| **How do I apply?** | Application Tracker with a full status workflow, document checklist and reference numbers |
| **How do I pay for it?** | 24 funding options + a Cost Planner that estimates annual cost, funding gap and saves the estimate |
| **Am I on track?** | 9-milestone student roadmap with live progress |
| **How am I doing?** | Daily wellness check-ins with trends and a mood chart |
| **Am I consistent?** | Study streaks, weekly goals and subject progress |
| **What should I do next?** | Rule-based AI Companion that answers in plain language with rich cards |

---

## Highlights

- **Fully offline-first** — installable PWA, works with zero connectivity after first load
- **No backend** — everything lives in `localStorage` / `sessionStorage`
- **No API keys, no tracking, no network calls** beyond Google Fonts
- **Mobile-first** — bottom tab navigation + drawer on phones, sidebar on desktop
- **Accessibility** — keyboard focus rings, reduced-motion support, ARIA roles, print-friendly
- **No emojis in code** — every icon is a hand-drawn inline SVG in `currentColor`

---

## Tech stack

- **React 18** + **Vite 5**
- **React Router v6** — 20+ routes
- **Plain CSS** — design tokens in `src/styles/tokens.css`
- **vite-plugin-pwa** — service worker + manifest, auto-generated
- **localStorage only** — no server, no database, no external services

---

## Run it locally

```bash
# Install
npm install

# Dev server
npm run dev

# Production build + preview
npm run build
npm run preview -- --host