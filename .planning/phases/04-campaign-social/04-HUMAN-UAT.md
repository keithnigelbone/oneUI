---
status: partial
phase: 04-campaign-social
source: [04-VERIFICATION.md]
started: 2026-06-02
updated: 2026-06-02
---

## Current Test

[awaiting human testing]

## Tests

### 1. Campaign brief → plan → direction selection (HITL) round-trip
expected: For a `social-post` / `instagram-carousel` artifact type, the RequestPanel reveals the Campaign brief fields (audience / objective / channel). Running posts the brief; a campaign-plan card renders on the tldraw canvas showing the brief summary, target audience, message hierarchy, exactly 3 creative directions, and a recommended direction. Selecting a direction + frame count and confirming POSTs to `/api/experience-lab/resume` with `{ directionIndex, frameCount }` and re-enters the suspended workflow.
result: [pending]

### 2. Carousel frames render as an ordered tldraw group
expected: After direction selection, N ordered frames generate and render left-to-right as a single carousel group ("Frame n of N"), each frame provably DS-compliant (passes its own validate/evaluate loop), sharing one `variantGroupId` with sequential `orderIndex`.
result: [pending]

### 3. Export card-action menu → real deliverable files
expected: The export card-action menu on a carousel/artifact offers Code / PNG / JPG / PDF. Code returns the persisted TSX + resolved Jio CSS (no re-generation). PNG/JPG re-render at the foundation-resolved native size. PDF composes the ordered per-frame full-res rasters one frame per page in carousel order. Bytes persist to Convex `_storage` and surface as an `export` card with a working download link.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
