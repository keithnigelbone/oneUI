---
status: partial
phase: 03-preview-eval-repair
source: [03-VERIFICATION.md, 03-08-SUMMARY.md]
started: 2026-06-01T21:12:00Z
updated: 2026-06-01T22:45:00Z
---

## Current Test

number: 1
name: Artifact card renders a scaled live iframe with correct Jio fonts + brand CSS (re-test after 03-08 RC1/RC2/RC3 fix)
expected: |
  After a successful generation run, the artifact card shows a LIVE iframe of the composed
  UI (not just the IR tree / Valid IR badge). The iframe loads /internal/render-ast?token=<uuid>
  and resolves the AST (no "AST not found or expired") even when viewed seconds-to-minutes
  after the run finishes and across iframe reloads (RC1: 30-min interactive TTL). Jio fonts
  and brand CSS load correctly with no CORS / "Domains, protocols and ports must match" errors
  (RC2: trusted AST path uses sandbox="allow-scripts allow-same-origin"). The 1440px desktop
  render is scaled down to fit the ~360px card region — visible and not cropped (RC3).
awaiting: user response

## Tests

### 1. Artifact card renders a scaled live iframe with correct fonts + brand CSS (post-03-08 re-test)
expected: |
  Live iframe renders the composed UI inside the real brand CSS cascade; AST resolves within
  the 30-min interactive window and survives reloads; fonts/CSS load without CORS errors;
  desktop render scaled to fit the card region.
why_human: Requires a running Lab canvas + a real generation run + visual confirmation of the rendered, scaled, correctly-fonted preview. Cannot automate end-to-end in a headless test.
result: pending
prior_result: issue
prior_reported: "After 03-07: iframe loaded /internal/render-ast?token=<uuid> but showed 'AST not found or expired', fonts blocked by CORS from a null origin, 'Domains, protocols and ports must match' error, and the preview box was small/unscaled so even a working render looked cropped."
fix_applied: "03-08 — RC1: INTERACTIVE_TOKEN_TTL_MS (30 min) for the Lab AST token; RC2: trust-scoped sameOrigin flag threads LabAstExecutor → runStream → shape → PreviewRegion so the AST iframe gets allow-same-origin while untrusted Daytona/IframeCsp paths stay strict allow-scripts; RC3: scale(calc(100vw / 1440)) transform on the render-ast page."
verification: "21/21 must-haves VERIFIED in code (03-VERIFICATION.md); versionTimeline 8/8 pass; preview typecheck clean. Awaiting live human confirmation."

### 2. Canvas live-iframe renders at >=30fps with 50+ cards in lifecycle progression
expected: Thumbnail → lightweight → live lifecycle keeps the canvas responsive with many cards. No jank or layout thrashing.
why_human: Requires a running canvas, visual frame-rate observation, and 50+ simultaneous artifact cards. Cannot automate in a headless test. (Phase 3 Success Criterion #1, second clause.)
result: pending

### 3. Live zero-egress network probe: Daytona sandbox cannot reach Convex/auth
expected: A fetch from inside the sandbox to the Convex URL is blocked. The sandbox is genuinely credential-free.
why_human: Requires real Daytona credentials + a live sandbox + an active network probe to the Convex URL. Explicitly deferred per 03-VALIDATION.md. The credential-free contract test proves the API contract; the egress guarantee requires a live probe.
result: passed
verified_by: ../03.1-daytona-zero-egress-render-pipeline/03.1-LIVE-VERIFY.md
reason: "RESOLVED in Phase 03.1. With real Daytona credentials, a live probe in a networkBlockAll sandbox (snapshot oneui-preview-v1) ran `node preview/probe.js <convex-url>` → stdout `EGRESS-BLOCKED: fetch failed`, exit 0 — the outbound fetch to Convex was refused. PREV-01 proven on real account groovy-spider-923."

### 4. VariantGroupFrame live canvas registration
expected: Best-of-N variant siblings cluster visually in a tldraw frame on the live canvas.
why_human: VariantGroupFrame is implemented and tested but not registered in ExperienceLabCanvas (single 'frame'-type collision with RunGroupFrame — documented deferral). Registration requires a follow-up (name-driven frame util or distinct custom frame type) and visual confirmation.
result: skipped
reason: "Known documented deferral per 03-VERIFICATION.md and 03-06-SUMMARY. Single 'frame'-type collision with RunGroupFrame. Registration pending a follow-up approach."

## Summary

total: 4
passed: 1
issues: 0
pending: 2
skipped: 1
blocked: 0

## Gaps

(No open code gaps — all 21 must-haves verified in 03-VERIFICATION.md after 03-08 gap closure. Remaining items are live/visual human testing, a third-party-blocked egress probe, and one documented deferral.)
