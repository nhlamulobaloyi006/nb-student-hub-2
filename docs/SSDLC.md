# SSDLC — Secure Software Development Life Cycle

**Model chosen:** Iterative development with continuous deployment.

## 1. Requirements

- **Input:** informal interviews with 3 recent matriculants + 1 first-year student
- **Output:** mapped every question a learner asks after matric into a single funnel diagram
- **Artefacts:** persona sketches, funnel diagram, screen inventory (20 pages)

## 2. Design

- Dark-mode UI built on design tokens (`src/styles/tokens.css`)
- Contract-first data shapes for `course`, `institution`, `funding`, `career`
- Every screen mocked before implementation

## 3. Implementation

- Built in 11 independently-testable phases
- Each phase shipped as complete files (never partial patches)
- Each phase had a verification block before moving on

## 4. Testing

- Manual test checklist per phase
- Browser coverage: Chrome, Edge, Firefox, Android Chrome, iOS Safari
- PWA tested offline via DevTools and HTTPS tunnels
- Console errors checked on every route

## 5. Deployment

- Vercel auto-deploys on push to `main`
- Service worker precaches the app shell on first visit
- In-app "new version available" prompt for every subsequent deploy

## 6. Maintenance

- No backend → no server maintenance
- Data lives on the device
- Updates land via the service worker update prompt

## Security considerations

| Concern | How it's handled |
|---|---|
| Server-side exploits | No backend exists — nothing to attack |
| Password storage | Demo-only hash, documented in `AuthContext.jsx`, not production-grade |
| API keys | None exist — zero secret management overhead |
| CSP | No inline scripts beyond the Vite build output |
| HTTPS | Enforced by the browser for PWA — not by us |
| Input validation | Every form field validated in UI + in `AuthContext` / `subjectRules` |
| Data privacy | Zero analytics, zero tracking, zero outbound requests except Google Fonts |

## Test coverage summary

- Every phase verified with `grep` + empty-file checks
- Cross-browser manual verification
- Offline end-to-end test on desktop and mobile
- No automated test suite (hackathon scope — the app has no runtime logic beyond deterministic utilities)