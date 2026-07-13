---
name: validate
description: Run the validate_oneui_code gate on the current file or selection. Catches inline-surface-paint, legacy tokens, unknown/hallucinated props, non-released components, banned icon libs, and literal colors/fonts — against the installed component API. Use after writing or editing any OneUI TSX, and before declaring a task done.
---

# /oneui:validate

Certify OneUI TSX against the design-system rules.

## Flow
1. Take the TSX from the active file / selection (or the file path the user names).
2. Detect the platform: `react` for `@jds4/oneui-react` imports, `reactnative` for `@oneui/ui-native`.
3. **`validate_oneui_code(tsx, platform)`** (server `oneui`).
4. For each issue, apply the suggested fix:
   - `inline-surface-paint` → replace inline background with a `<Surface mode="...">` wrapper.
   - `legacy-token` → swap to the role-explicit token in the suggestion.
   - `unknown-prop` → remove/rename to the correct prop from `get_component_info`.
   - `non-released-component` → the component isn't importable from the installed package; pick a released one.
   - `literal-color` / `hardcoded-font` (native) → replace with `tokens.*`.
5. Re-run until the gate returns **"All clear."**

## Returns
The validation issue table, then the fixes applied (if any) and a clean re-run.

## Related
- `get_component_info(name)` — confirm the real prop names.
- `validate_oneui_code` MCP tool (this command's engine).
