# NB Student Hub

> **Know your options. Plan your future.**

A student guidance platform for South African matric and tertiary learners — course matching, eligibility, funding, applications, wellness and more.

Built for the **FNB App of the Year 2026 — Access to Higher Education** challenge.

---

## Table of contents

- [What it does](#what-it-does)
- [Highlights](#highlights)
- [Install as an app](#install-as-an-app)
- [Demo credentials](#demo-credentials)
- [The guided journey](#the-guided-journey)
- [Feature map](#feature-map)
- [AI Companion (NBOT)](#ai-companion-nbot)
- [Tech stack](#tech-stack)
- [Run it locally](#run-it-locally)
- [Testing the PWA](#testing-the-pwa)
- [Project layout](#project-layout)
- [Data & utilities](#data--utilities)
- [APS rules](#aps-rules)
- [Mobile experience](#mobile-experience)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [What's deliberate](#whats-deliberate)
- [Credits](#credits)
- [License](#license)

---

## What it does

NB Student Hub answers the questions every SA learner faces after matric:

| Question | Where |
|---|---|
| **What can I study?** | Course Finder — matches 89 courses across 20 institutions against the learner's subjects, marks and stream |
| **Do I qualify?** | APS + subject-level eligibility engine with a transparent breakdown |
| **Where can I study?** | 20 institutions across University / University of Technology / TVET / Private College tiers |
| **How do I apply?** | Application Tracker with a full status workflow, document checklist and reference numbers |
| **How do I pay for it?** | 24 funding options + a Cost Planner that estimates annual cost, funding gap and saves the estimate |
| **What if I don't qualify?** | Matric Upgrade page with 6 second-chance pathways |
| **Am I on track?** | 9-milestone student roadmap with live progress |
| **How am I doing?** | Daily wellness check-ins with trends and a mood chart |
| **Am I consistent?** | Study streaks with a daily check-in, grace day and restore flow |
| **What should I do next?** | NBOT — a rule-based AI Companion that answers in plain language with rich cards |

---

## Highlights

- **Fully offline-first** — installable PWA, works with zero connectivity after first load
- **No backend** — everything lives in `localStorage` / `sessionStorage`
- **No API keys, no tracking, no network calls** beyond Google Fonts
- **Mobile-first** — bottom tab navigation + slide-in drawer on phones, sidebar on desktop
- **Guided onboarding funnel** — sign up → wizard → course matches → apply → funding → careers → upgrade
- **Auto-updating PWA** — new deploys surface an in-app "Reload" prompt instead of silently serving stale code
- **Accessibility** — keyboard focus rings, reduced-motion support, ARIA roles, print-friendly
- **No emojis in code** — every icon is a hand-drawn inline SVG in `currentColor`
- **No native dialogs** — every `confirm` / `alert` / `prompt` is a styled in-app component

---

## Install as an app

NB Student Hub is a **Progressive Web App**. Users can install it on their home screen without an app store.

**Android (Chrome, Edge, Samsung Internet)**
1. Open the URL in Chrome
2. Tap the three-dot menu → **Install app**
3. Confirm — the icon appears on the home screen
4. Opens full-screen, no browser chrome
5. Works offline

**iPhone / iPad (Safari only)**
1. Open the URL in **Safari** (not Chrome)
2. Tap **Share** → **Add to Home Screen**
3. Confirm — the icon appears on the home screen

**Desktop (Chrome, Edge)**
1. Open the URL
2. Click the install icon in the address bar

An **in-app install banner** appears on the Dashboard for users who haven't installed yet, with the correct hint for each platform. Dismissed → muted for 7 days.

---

## Demo credentials

**Any email and password work.** Sign up on `/signup` and you're in.

Suggested demo flow:

1. Open the app → sign up as `demo@nbhub.co.za` / `demo123`
2. **Guided wizard** walks you through Stream → Subjects → Marks → Interests
3. After saving: **celebration modal** shows courses you qualify for
4. Click **Browse all matches** → Course Finder filters to those courses
5. Tap a course → detail panel with tabs (Overview / Requirements / Costs / Funding)
6. **Add as application** glows gold → click → **funding match modal** fires
7. Dismiss it → **5 seconds later, career match modal fires**
8. Click **See careers with NBOT** → chat opens with a pre-seeded prompt
9. Continue to Funding, Cost Planner, Wellness, Streaks, Matric Upgrade, NBOT

To reset:

```js
localStorage.clear();
sessionStorage.clear();
location.reload();