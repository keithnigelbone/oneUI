# Preview Hosting Decision: Separate Origin (PREVIEW-DECISION)

> **P1 HIGH-severity deliverable.** Resolves Open Question #5 ("Separate preview origin feasibility") and documents the Security Domain V12 sandbox controls for threat **T-01-21** (preview iframe leaking auth/Convex tokens). **Decision is made now (P1); the preview is built and security-reviewed in P3.** This package is a stub until then.

---

## Decision

**Compiled artifact previews are served from a SEPARATE ORIGIN — not from the Lab's own origin, and not from an `srcdoc` iframe inside it.**

The preview iframe runs sandboxed with `allow-scripts` **WITHOUT `allow-same-origin`**, behind a strict Content-Security-Policy, fed a **server-resolved bundle** via a short-lived token handoff. **Zero auth/session/Convex tokens ever reach the preview context.**

```
Lab origin (authenticated)                    Preview origin (distinct, credential-free)
┌─────────────────────────┐                   ┌──────────────────────────────────────┐
│ Lab canvas + panels      │  server-side      │  <iframe                              │
│ (Convex session, auth)   │  token handoff    │    sandbox="allow-scripts"            │
│                          │ ───────────────▶  │    src="https://preview.<host>/r?t=…">│
│  POST artifact → token   │  (no tokens in    │  resolves bundle by token, renders    │
│                          │   the URL/body)   │  IR → React + Jio CSS, no secrets     │
└─────────────────────────┘                   └──────────────────────────────────────┘
```

---

## Why separate origin (not `srcdoc` + CSP)

A same-origin `srcdoc` iframe — even with a CSP — shares the parent's origin. Generated/AI-authored code running inside it can reach same-origin storage, cookies, and `window.parent` in ways that are hard to fully neutralise. The Core Value is that **AI-generated code is untrusted**: it must not be able to exfiltrate the authenticated user's Convex/session tokens. A distinct origin makes the trust boundary a browser-enforced same-origin-policy boundary, not a policy we hand-roll.

## Sandbox controls (Security Domain V12 — built P3)

| Control | Setting | Why |
|---------|---------|-----|
| iframe `sandbox` | `allow-scripts` **only** | Scripts run, but the frame is assigned a unique opaque origin. |
| iframe `sandbox` | **NO `allow-same-origin`** | Without it the preview cannot access the Lab origin's storage, cookies, or DOM. This is the single most important control. |
| CSP | strict `default-src`, `script-src`, `connect-src` | The preview can load only the server-resolved bundle + Jio CSS; it cannot phone home. |
| CSP | `frame-ancestors` pinned to the Lab origin | Only the Lab may embed the preview — no clickjacking host. |
| `postMessage` | explicit `targetOrigin` + inbound origin checks | All cross-frame messaging validates the origin on both ends; no wildcard `*`. |
| Tokens | **zero auth/Convex tokens in the preview** | The preview never receives a session — it renders a pre-resolved bundle. |
| Playwright (P3 verification) | credential-free workers | Visual/verification workers run against the preview origin with no auth context. |

## Server-side token-handoff basis (Pattern 4 — VERIFIED in repo)

The existing `apps/platform/src/app/internal/render-ast/page.tsx` already implements the right model: it resolves the artifact **server-side** via a short-lived token (`consumeASTForRender(token)`), gated by an `x-internal-render` secret, with **nothing sensitive in the URL**. The P3 preview reuses this pattern:

1. The Lab compiles the validated IR → an AST/bundle **server-side** (approved Jio imports only).
2. The server stashes the bundle behind a short-lived, single-use token.
3. The preview iframe (separate origin) is given only the token in its `src`.
4. The preview origin resolves the bundle server-side and renders **IR → React + Jio CSS** inside the real brand CSS cascade.
5. The token expires; nothing sensitive ever lives in the browser address bar or the preview's JS context.

The P3 preview will need its own render secret (the `x-internal-render` pattern already exists) — documented here so P3 has no surprises.

---

## Scope boundary

- **P1 (now):** decision only. This package ships a `package.json` stub so the workspace links it; no runtime code.
- **P3:** build the separate-origin preview route, the iframe host component, the token-handoff endpoint, the CSP headers, and the credential-free Playwright verification loop — then run the security review against the controls above.

## Threat coverage

| Threat | Mitigation | Built |
|--------|-----------|-------|
| **T-01-21** — preview iframe leaks auth/Convex tokens | Separate origin, `allow-scripts` without `allow-same-origin`, strict CSP + `frame-ancestors`, `postMessage` origin checks, zero tokens in preview, credential-free Playwright | Decided P1, built + reviewed P3 |
