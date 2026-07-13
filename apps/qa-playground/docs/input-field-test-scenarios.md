# InputField — QA test scenarios

Playground: `/c/input-field` · Component: `@oneui/ui` `InputField` · Figma: `.DNA/InputField`

**Figma Validation tab** (`InputField - Figma Validation`): size matrix M · S · L — label `Label`, placeholder `Placeholder`, `start` heart icon, `end` microphone icon. Cells: `figma-input-field-sz-M|S|L` · grid: `figma-input-field-grid` · section: `input-field-qa-figma-validation-matrix`.

## QA boolean axes (Figma-style)

| Axis | Code API | Notes |
|------|----------|--------|
| size S/M/L | `size`: `8` / `10` / `12` (or `'s'`/`'m'`/`'l'`) | Label tier follows input size |
| label | `label?: string` | Omit string = no visible label |
| required | `required?: boolean` | Asterisk only when `label` is non-empty |
| infoIcon | `infoIcon?: boolean` | **Only renders when `label` is set** |
| description | `description?: string` | `Field.Description` below label row |
| feedback | `error?: string` or `feedback` slot | Shorthand uses `InputFeedback` negative |
| dynamicText | `dynamicText` + `helperButton` | `InputDynamicText` row |
| disabled | `disabled?: boolean` | Field + input + dynamic row |

## Invalid / redundant combinations

| Combination | Verdict |
|-------------|---------|
| `infoIcon: true` without `label` | **Invalid UX** — implementation ignores info icon (no `hasLabelHeader`) |
| `required: true` without `label` | **Degraded** — no asterisk; use `aria-label` on input for SR name |
| `labelSlot` + `label` / `description` / `infoIcon` | **Redundant** — `labelSlot` replaces entire label stack |
| `feedback` slot + `error` string | Pick one — slot wins when both set |
| `dynamicTextSlot` + `dynamicText` / `helperButton` | Slot wins |
| Empty `error` with no `feedback` | Hidden `Field.Error` placeholder row still mounted |
| All booleans `false` | Valid **minimal** field (input only) |

## Property coverage matrix (minimum set)

- **Smoke (5):** route load, default mount, all-props mount, controls live preview, one pairwise cell
- **Per-axis (8):** size S/M/L, no-label, required, infoIcon, description, feedback, dynamicText, disabled
- **Pairwise (28):** seven 2×2 tables in playground band 7
- **Edge (9):** long copy, empty value, required/infoIcon without label, disabled+feedback/dynamic, minimal
- **A11y (5):** aria-label, required, description, disabled, feedback mounts

---

## Smoke test cases

### IFF-SMOKE-001
**Scenario Name:** Playground route loads  
**Precondition:** QA dev server on port 5180  
**Steps:** Navigate to `/c/input-field`; open Test Scenarios tab  
**Expected Result:** Heading “Input Field”; default `input-field-default` textbox visible  
**Priority:** P0

### IFF-SMOKE-002
**Scenario Name:** Default field is editable  
**Precondition:** Test Scenarios tab open  
**Steps:** Focus default email input; type `test@oneui.dev`  
**Expected Result:** Value updates; no playground fault overlay  
**Priority:** P0

### IFF-SMOKE-003
**Scenario Name:** All-properties mount renders full stack  
**Precondition:** Band 2 visible  
**Steps:** Scroll to `input-field-all-props`  
**Expected Result:** Label, description, info control, input, feedback, dynamic row visible  
**Priority:** P0

### IFF-SMOKE-004
**Scenario Name:** Controls panel live preview  
**Precondition:** Band 9 visible  
**Steps:** Toggle size to L  
**Expected Result:** Live preview input `data-size="12"`  
**Priority:** P1

### IFF-SMOKE-005
**Scenario Name:** No console errors on load  
**Precondition:** Fresh navigation  
**Steps:** Load Test Scenarios; wait for default field  
**Expected Result:** Zero `console.error` / `pageerror`  
**Priority:** P0

---

## Functional test cases (representative)

### IFF-FN-001
**Scenario Name:** Size S/M/L map to data-size 8/10/12  
**Precondition:** Band 3  
**Steps:** Inspect each size scenario input  
**Expected Result:** `data-size` matches Figma S/M/L codes  
**Priority:** P0

### IFF-FN-002
**Scenario Name:** Typography scales S → M → L  
**Precondition:** Band 3  
**Steps:** Compare computed font-size on three inputs  
**Expected Result:** Non-decreasing font sizes  
**Priority:** P1

### IFF-FN-003
**Scenario Name:** Required shows asterisk in label  
**Precondition:** `input-field-required`  
**Steps:** Read label text  
**Expected Result:** Visible `*` (aria-hidden) with label copy  
**Priority:** P0

### IFF-FN-004
**Scenario Name:** Error feedback displays message  
**Precondition:** `input-field-feedback`  
**Steps:** Read feedback row  
**Expected Result:** Negative feedback copy visible; input `invalid` styling  
**Priority:** P0

### IFF-FN-005
**Scenario Name:** Dynamic text row with helper action  
**Precondition:** `input-field-dynamic-text`  
**Steps:** Verify leading copy and trailing button  
**Expected Result:** Character hint + “Forgot?” (or configured helper) visible  
**Priority:** P1

### IFF-FN-006
**Scenario Name:** Disabled input not editable  
**Precondition:** `input-field-disabled`  
**Steps:** Attempt to type in field  
**Expected Result:** `disabled` on textbox; no value change  
**Priority:** P0

### IFF-FN-007
**Scenario Name:** Controls — label toggle  
**Precondition:** Controls panel; label on  
**Steps:** Uncheck label; observe live preview  
**Expected Result:** No visible `<label>`; textbox remains  
**Priority:** P1

### IFF-FN-008
**Scenario Name:** Controls — required + feedback toggles  
**Precondition:** Controls panel  
**Steps:** Enable required and feedback  
**Expected Result:** Asterisk when label on; error message under input  
**Priority:** P1

### IFF-FN-009
**Scenario Name:** Empty value mount  
**Precondition:** `input-field-edge-empty-value`  
**Steps:** Inspect input value  
**Expected Result:** Empty string; placeholder visible  
**Priority:** P2

### IFF-FN-010
**Scenario Name:** Theme toggle  
**Precondition:** Playground chrome  
**Steps:** Toggle light/dark  
**Expected Result:** `html[data-theme]` changes  
**Priority:** P2

---

## Accessibility test cases

### IFF-A11Y-001
**Scenario Name:** WCAG 2.1 AA axe — full showcase  
**Precondition:** Test Scenarios loaded  
**Steps:** Run axe on `[data-section^="input-field-qa"]`  
**Expected Result:** Zero serious/critical violations  
**Priority:** P0

### IFF-A11Y-002
**Scenario Name:** Label associated with control  
**Precondition:** Default field  
**Steps:** Inspect accessible name of textbox  
**Expected Result:** Name includes “Email address” (or label text)  
**Priority:** P0

### IFF-A11Y-003
**Scenario Name:** Description exposed to assistive tech  
**Precondition:** `input-field-a11y-description`  
**Steps:** Check description element id linkage / AT browse  
**Expected Result:** Description readable when label focused  
**Priority:** P1

### IFF-A11Y-004
**Scenario Name:** Required field — required attribute  
**Precondition:** `input-field-a11y-required`  
**Steps:** Inspect textbox  
**Expected Result:** `required` present on input  
**Priority:** P0

### IFF-A11Y-005
**Scenario Name:** aria-label without visible label  
**Precondition:** `input-field-a11y-aria-label`  
**Steps:** Inspect accessible name  
**Expected Result:** “Search query”; no visible label element  
**Priority:** P0

### IFF-A11Y-006
**Scenario Name:** Disabled state  
**Precondition:** `input-field-a11y-disabled`  
**Steps:** Tab to field; verify disabled  
**Expected Result:** Not editable; disabled semantics on control  
**Priority:** P0

### IFF-A11Y-007
**Scenario Name:** Error feedback alert/status  
**Precondition:** `input-field-a11y-feedback`  
**Steps:** Inspect feedback row role  
**Expected Result:** Live region / alert semantics for error copy  
**Priority:** P1

### IFF-A11Y-008
**Scenario Name:** Info icon button name  
**Precondition:** `input-field-info-icon`  
**Steps:** Focus info `IconButton`  
**Expected Result:** Accessible name (default “More information” or custom)  
**Priority:** P1

### IFF-A11Y-009
**Scenario Name:** Keyboard — controls panel  
**Precondition:** Band 9  
**Steps:** Tab to checkboxes; Space toggles required  
**Expected Result:** State updates; live preview reflects change  
**Priority:** P1

### IFF-A11Y-010
**Scenario Name:** Reflow 320px  
**Precondition:** Viewport 320×640  
**Steps:** Scroll each band (except pairwise/edge/playground skip list)  
**Expected Result:** No horizontal overflow on section containers  
**Priority:** P1

---

## Regression test cases

### IFF-REG-001
**Scenario Name:** infoIcon without label — no info button  
**Precondition:** `input-field-edge-info-icon-no-label`  
**Steps:** Query info `IconButton`  
**Expected Result:** Count 0 — documents API guard (consider Figma/code alignment)  
**Priority:** P1

### IFF-REG-002
**Scenario Name:** Required without visible label  
**Precondition:** `input-field-edge-required-no-label`  
**Steps:** Inspect input  
**Expected Result:** `required` attribute set; `aria-label` provides name  
**Priority:** P1

### IFF-REG-003
**Scenario Name:** Disabled + feedback  
**Precondition:** `input-field-edge-disabled-feedback`  
**Steps:** Verify disabled + error copy  
**Expected Result:** Input disabled; feedback still visible  
**Priority:** P1

### IFF-REG-004
**Scenario Name:** Disabled + dynamic text  
**Precondition:** `input-field-edge-disabled-dynamic`  
**Steps:** Inspect dynamic row `data-disabled`  
**Expected Result:** Row reflects disabled; helper not actionable  
**Priority:** P2

### IFF-REG-005
**Scenario Name:** Long label wrapping  
**Precondition:** `input-field-edge-long-label`  
**Steps:** Narrow viewport 320px  
**Expected Result:** Label wraps; no layout break; info icon remains in row  
**Priority:** P2

### IFF-REG-006
**Scenario Name:** Pairwise label×required TT  
**Precondition:** `input-field-pw-label-required-tt`  
**Steps:** Verify label + asterisk + required attr  
**Expected Result:** All three present  
**Priority:** P1

---

## Pairwise tables (playground band 7)

Each cell: `input-field-pw-{pair}-{ff|ft|tf|tt}` where first letter = first axis false/true, second = second axis.

| Pair | Axes |
|------|------|
| label-required | label × required |
| label-description | label × description |
| label-info-icon | label × infoIcon |
| feedback-dynamic | feedback × dynamicText |
| feedback-disabled | feedback × disabled |
| description-feedback | description × feedback |
| description-dynamic | description × dynamicText |

---

## Playground named examples (band 6)

| testId | Intent |
|--------|--------|
| `input-field-playground-basic` | Label only |
| `input-field-playground-required` | Required |
| `input-field-playground-description` | Description |
| `input-field-playground-info-icon` | Info icon |
| `input-field-playground-feedback` | Error feedback |
| `input-field-playground-dynamic-text` | Dynamic row |
| `input-field-playground-disabled` | Disabled |
| `input-field-playground-size-large` | Size L |
| `input-field-playground-size-small` | Size S |
| `input-field-playground-all-content` | All axes on |
| `input-field-playground-no-content` | Minimal input-only |

---

## API notes / suspected bugs

1. **`infoIcon` without `label`** — silently no-op; Figma may imply icon in label row — consider requiring label or supporting orphan info row.
2. **`required` without `label`** — asterisk never shown; only HTML `required` — document or add `aria-required` on labelled-by path.
3. **Hidden empty `InputFeedback`** when no error — extra DOM for `Field.Error` slot; verify AT noise.
4. **`labelSlot`** makes `infoIcon` / `description` props redundant — prefer single composition API in docs.
5. **`aria-label` on `InputField`** — not forwarded to inner `Input`; use visible `label` or `placeholder` for accessible name.
6. **Disabled dynamic text** — `InputDynamicText` disabled copy may fail WCAG contrast (4.39:1) — tracked in edge band; excluded from full-page axe scope until fixed in `@oneui/ui`.

---

## Automation

```bash
pnpm --filter @oneui/qa-playground qa:input-field:report
```

Playwright: `e2e/input-field-qa.spec.ts`, `e2e/input-field-accessibility.spec.ts`  
Manifest: `e2e/input-field-playground/manifest.ts`
