---
name: prd
description: Drop the One UI PRD template into the chat to fill in. Once completed, hand it to /oneui:build-from-prd to generate the screens. Use when the user wants to spec a feature before building.
---

# /oneui:prd

Get the One UI PRD template to fill in.

## Flow

Invoke the `oneui-prd` MCP prompt (server `oneui`). It returns the blank PRD template
(Brand & theme, Scope v1 vs Deferred, Screens & flow, Data, References, Acceptance criteria)
plus a worked example.

## Next step

Fill in the template, then run `/oneui:build-from-prd` with the completed template as the
requirement. The build command parses §2 (brand/theme), §3 (scope — Deferred is NOT built),
§4 (screens & flow), and §8 (acceptance criteria = the self-heal stop condition).

## Related
- `/oneui:build-from-prd` — consumes the completed template.
- `get_prd_template` MCP tool / `oneui://prd-template` resource.
