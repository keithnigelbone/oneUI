# SelectableSingleTextButton — prop validation (QA playground vs API table)

**Source of truth:** `packages/ui/src/components/SelectableSingleTextButton/SelectableSingleTextButton.shared.ts` and `SelectableSingleTextButton.tsx`  
**Playground:** `apps/qa-playground/src/components/selectable-single-text-button/SelectableSingleTextButtonQaShowcase.tsx`

| API / design field | In `@oneui/ui`? | Playground coverage |
| --- | --- | --- |
| `size` (`S` / `M` / `L` → `s` / `m` / `l`) | Yes | Section 2, matrices, loading-by-size |
| `attention` (`high` / `medium` / `low`) | Yes | Section 3, size×attention, attention×appearance |
| `appearance` (9 roles incl. `auto`) | Yes | Section 4 (default + bold `Surface`), matrices, disabled/loading combos |
| `condensed` | Yes | Section 5, condensed×size, combinations |
| `disabled` | Yes | Section 6, combinations |
| `loading` | Yes | Section 7, combinations; disables control, `aria-busy`, CPI replaces text |
| `accent` (code-only in table) | **No** — no `accent` prop on component | Section 8 + 15: documented + TODO; matrix skipped |
| `content` (`text` / `circularProgressIndicator`, code-only) | **No** — text via `children`; spinner only when `loading=true` | Section 9 + 16: documented + TODO; behaviour shown with real component |

**Additional implemented props (not in the screenshot table):** `selected`, `defaultSelected`, `onSelectedChange`, `value`, `fullWidth`, `className`, `style`, `aria-label`, `data-testid` (QA anchor on root `<button>`).

**Runbook:** open `/c/selectable-single-text-button` in the QA playground (Vite dev server, default port from app config — not a separate port-3333 bundle).

**Playwright:** from repo root, `pnpm qa:selectable-single-text-button:report` (functional + accessibility, axe HTML report, `public/qa-reports/selectable-single-text-button-summary.json` for the component QA dashboard).
