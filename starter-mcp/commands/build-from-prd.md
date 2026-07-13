---
name: build-from-prd
description: Build a OneUI-compliant screen from a PRD or a free-text feature description. Orchestrates the full load-invariants → search-knowledge → pick-components → load-brand → write-TSX → validate → self-heal loop using the OneUI MCP tools. Use when the user has a product requirement and wants a token-compliant, brand-correct, WCAG-AA component (React web or React Native).
---

# /oneui:build-from-prd

Build a OneUI screen from a requirement, end to end.

## Flow

Invoke the `oneui-build-from-prd` MCP prompt (server `oneui`) with the user's requirement.
That prompt drives the mandatory workflow — do not shortcut it:

1. **`get_core_invariants()`** — the always-apply rules (zero literals, role-explicit typography, surface wrapping, focus halo, shape defaults).
2. **`search_design_system(...)`** + `get_skill("oneui")` / `get_skill("oneui-design-composition")` / `get_skill("surface")` / `get_skill("surface-context")`.
3. **`list_components()`** + `get_component_info(name)` for every component you plan to use — read `compositionRules`, `variantLogic`, exact `props`. Do not invent props.
4. **`get_brand_tokens(brand, true)`** — colour roles + fonts for the target brand (default `jio`).
5. **Write the TSX** — wrap in `<BrandProvider brand="...">` (web) / `<OneUIBrandProvider brand="..." theme="...">` (native); every tinted/dark area is a `<Surface mode="...">`; tokens only.
6. **`validate_oneui_code(tsx, platform)`** — the gate.
7. **Self-heal up to 3 passes** — fix `inline-surface-paint`, `legacy-token`, `unknown-prop`; re-validate until "All clear".

## Inputs the user can give inline
- A short free-text description, OR a completed OneUI PRD template (run `/oneui:prd` to get one).
- Target brand (default `jio`) — e.g. "build it for tira".
- Route/page context — e.g. "/checkout", "ProfileScreen".
- Platform — web (default) or react native.

## Returns
The final validated TSX + a summary: components chosen (with variant/attention rationale), surface modes applied, brand/font overrides, and accessibility decisions.

## Related
- `/oneui:prd` — get a blank PRD template to fill first.
- `/oneui:validate` — re-run the gate on an existing file.
- `oneui-build-from-prd` MCP prompt (this command's engine).
