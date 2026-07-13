# Phase 1: Isolated Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-30
**Phase:** 01-isolated-foundation
**Areas discussed:** Request & run UX, Canvas object-model scope

---

## Gray-area selection

Offered: Request & run UX · Mock artifact card · Canvas object-model scope · Event stream & gap-report surfacing.
**Selected to discuss:** Request & run UX, Canvas object-model scope.
**Left to Claude's discretion:** Mock artifact card, Event stream & gap-report surfacing (+ Lab entry-point).

---

## Request & run UX

### Q1 — Where do request controls live?
| Option | Description | Selected |
|--------|-------------|----------|
| Inline on the prompt card | Text + selectors + Run all on one tldraw shape | |
| Docked request panel | Prompt card holds prompt text; selectors + Run in a docked inspector (ExperienceCanvas prop-panel pattern) | ✓ |
| Hybrid: toolbar defaults + per-card override | Global toolbar defaults, per-card override | |

**User's choice:** Docked request panel.

### Q2 — Brand/sub-brand source in P1
| Option | Description | Selected |
|--------|-------------|----------|
| Real Convex brands (read-only) | Selector reads live brands list; mock boundary stays at the resolver | ✓ |
| Hardcoded mock brand list | Static throwaway list, decoupled from Convex | |

**User's choice:** Real Convex brands (read-only).

### Q3 — Artifact type ↔ output profile relationship
| Option | Description | Selected |
|--------|-------------|----------|
| Profile filtered by artifact type | Type narrows valid profiles; type→profile map in the contract | ✓ |
| Independent flat lists | Two independent selectors, any combination allowed | |

**User's choice:** Profile filtered by artifact type.

### Q4 — Panel ↔ card run model
| Option | Description | Selected |
|--------|-------------|----------|
| Panel edits the selected prompt card | Config persists on card; Run → linked artifact card; strong lineage | ✓ |
| Panel is a global composer | Standalone composer; Run spawns fresh prompt+artifact pair | |

**User's choice:** Panel edits the selected prompt card.

---

## Canvas object-model scope

### Q1 — How much of the card union does P1 build?
| Option | Description | Selected |
|--------|-------------|----------|
| Full type union, thin rendering | Full union in IR + canvas contract now; render a subset | ✓ |
| Build all card shapes now | Implement renderers for every card type | |
| Minimal subset, defer the union | Only prompt + artifact; add union per phase | |

**User's choice:** Full type union, thin rendering.

### Q2 — Which cards render in P1? (multi-select)
| Option | Description | Selected |
|--------|-------------|----------|
| Prompt card | Request origin (CANVAS-02) | ✓ |
| Artifact card | Appears after mock run (CANVAS-04) | ✓ |
| Foundation-profile card | Resolved foundation + typed gap-report state (FND-01/03) | ✓ |
| Component-reference card | Registry-retrieved components (REG-01/02) | ✓ |

**User's choice:** All four.

### Q3 — Run lineage representation
| Option | Description | Selected |
|--------|-------------|----------|
| Run-group frame | Labeled tldraw frame per run; scales to variants/carousels | ✓ |
| Arrow/binding connectors | Free-floating cards linked by tldraw arrows | |
| Parent-child auto-layout | Children auto-positioned around the prompt card | |

**User's choice:** Run-group frame.

### Q4 — P1 persistence scope
| Option | Description | Selected |
|--------|-------------|----------|
| Runs + IR + canvas layout persist | Everything to `experience*` Convex tables | |
| Runs + IR persist, canvas layout ephemeral | Durable artifacts real; layout local/session | ✓ |
| Runs only (minimum for VER-03) | Only run/event state persists | |

**User's choice:** Runs + IR persist, canvas layout ephemeral.

---

## Claude's Discretion

- **Mock artifact-card fidelity:** structured IR-summary card + IR/JSON inspector toggle; no faked real-DOM preview (P3).
- **Agent event-stream surfacing:** docked run-inspector timeline panel + lightweight status on the artifact card; chat-style feed deferred to P3.
- **Gap-report UX:** foundation-profile card flips to a typed gap-report state (component-reference card for unregistered-component gaps); a gap short-circuits the run — no artifact card.
- **Lab entry-point / discoverability:** dedicated `(experience-lab)` route group, reachable from main nav under a visible, clearly-separate "Experience Lab" entry.

## Deferred Ideas

- Chat-style activity feed / chat-based iteration → P3 (INPUT-05)
- Canvas layout sync to Convex → P5 (PROD-01)
- Real-DOM preview in the artifact card → P3 (PREV-*)
- Real `@ag-ui/*` adapter → P5 (INTEROP-01, v2)
- Embeddings/RAG component retrieval → v2 (REG-05)
