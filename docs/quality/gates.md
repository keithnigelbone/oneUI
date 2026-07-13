# Quality Gates

Automated validation scripts that enforce design system rules.

## Overview

Three primary quality gates prevent violations:

1. **check:literals** - Zero-tolerance literal detection
2. **validate:tokens** - Token resolution validation
3. **check:parity** - Platform parity validation

## 1. Check Literals

**Purpose**: Detect hard-coded values in components

**Command**: `pnpm check:literals`

**Scans**: All `.css` and `.tsx` files in `packages/ui/src`

**Detects**:
- ❌ Hex colors: `#ffffff`, `#000`
- ❌ RGB colors: `rgb(0, 0, 0)`, `rgba(0, 0, 0, 0.5)`
- ❌ OkLCH colors: `oklch(50% 0.15 340)`
- ❌ Hard-coded pixels: `16px`, `8px` (except `0`, `999px`, `100%`)
- ❌ Font sizes: `font-size: 14px`
- ❌ Font weights: `font-weight: 500`
- ❌ Border radius: `border-radius: 8px` (except `999px`)

**Allowed Values**:
- ✅ `0` and `0px`
- ✅ `999px` (pill shape)
- ✅ `100%`
- ✅ `transparent`
- ✅ `inherit`
- ✅ `var(--Token-Name)` - Token references

**Example Pass**:
```css
.button {
  background-color: var(--Surface-Bold);
  border-radius: var(--Shape-Pill);
  padding: var(--Spacing-4) var(--Spacing-4-5);
}
```

**Example Fail**:
```css
.button {
  background-color: #ffffff;    /* ❌ Hex color */
  border-radius: 8px;           /* ❌ Hard-coded pixels */
  padding: 16px 20px;           /* ❌ Hard-coded pixels */
}
```

**Fix**: Replace all literals with token references from `packages/tokens/src/css/primitives.css`

## 2. Validate Tokens

**Purpose**: Verify all token references resolve correctly

**Command**: `pnpm validate:tokens`

**Validates**:
- All `var(--Token-Name)` references exist
- No broken token chains
- All CSS custom properties defined

**Example Pass**:
```css
:root {
  --Shape-Pill: 999px;
}

.button {
  border-radius: var(--Shape-Pill); /* ✅ Resolves to 999px */
}
```

**Example Fail**:
```css
.button {
  border-radius: var(--Shape-Undefined); /* ❌ Token doesn't exist */
}
```

**Fix**: Add token definition to `packages/tokens/src/css/primitives.css`

## 3. Check Parity

**Purpose**: Ensure both platforms implement same components

**Command**: `pnpm check:parity`

**Validates**:
- Every web component has React Native equivalent
- Shared types match between platforms
- Same props interface on both

**Example Pass**:
```
✅ Button exists in:
   - packages/ui/src/components/Button/Button.tsx
   - packages/ui-native/src/components/Button/Button.native.tsx
```

**Example Fail**:
```
❌ Input missing React Native implementation
   - packages/ui/src/components/Input/Input.tsx exists
   - packages/ui-native/src/components/Input/Input.native.tsx MISSING
```

**Fix**: Create React Native implementation using scaffolding tool:
```bash
npx tsx scripts/generate-component.ts Input
```

## Full Quality Pipeline

### Pre-Commit (Run Before Git Commit)
```bash
pnpm typecheck     # TypeScript errors
pnpm check:literals # Literal violations
```

### Pre-Merge (Run in CI)
```bash
pnpm build         # Compilation
pnpm test          # Unit tests
pnpm test:a11y     # Accessibility tests
pnpm check:parity  # Platform parity
```

### Optional (Recommended)
```bash
pnpm validate:tokens  # Token resolution
pnpm lint             # ESLint rules
```

## Integration with CI/CD

Add to GitHub Actions / GitLab CI:

```yaml
- name: Check literals
  run: pnpm check:literals

- name: Validate tokens
  run: pnpm validate:tokens

- name: Check parity
  run: pnpm check:parity

- name: TypeScript
  run: pnpm typecheck
```

## Customization

Edit scripts to add/remove checks:

**Add new pattern to check:literals**:
```typescript
// scripts/check-literals.ts
const PATTERNS = {
  hexColor: /#[0-9a-fA-F]{3,8}\b/g,
  rgb: /rgba?\s*\([^)]+\)/g,
  // Add new pattern here
  customRule: /your-pattern/g,
};
```

**Add new validator**:
```bash
# Create packages/tokens/src/validators/custom.ts
# Add to scripts/validate.ts
```

## Troubleshooting

### "Unresolved token reference"

**Problem**: `var(--Surface-Undefined)` doesn't exist

**Solution**:
1. Check spelling in CSS
2. Define token in `packages/tokens/src/css/primitives.css`
3. Run `pnpm validate:tokens` to verify

### "Hard-coded pixel violation"

**Problem**: `padding: 16px 20px;` in CSS

**Solution**:
1. Find corresponding token in `packages/tokens/src/css/primitives.css`
2. Replace: `padding: var(--Spacing-4) var(--Spacing-4-5);`
3. Run `pnpm check:literals` to verify

### "Platform parity mismatch"

**Problem**: Web has Button but Native doesn't

**Solution**:
1. Generate scaffold: `npx tsx scripts/generate-component.ts Button`
2. Implement `Button.native.tsx`
3. Use shared types from `Button.shared.ts`
4. Run `pnpm check:parity` to verify

## Best Practices

1. **Run gates frequently** - Don't wait until merge
2. **Fix immediately** - Don't accumulate violations
3. **Use scaffolding tool** - Generates correct structure
4. **Copy from Button** - Reference implementation
5. **Automate in CI** - Catch issues early
6. **Document exceptions** - If you must break rules

## Whitelist

To skip checks for specific files (rarely needed):

```typescript
// scripts/check-literals.ts
const SKIP_FILES = [
  'packages/ui/src/legacy/**',  // Old component
];
```

Then add check before scanning:
```typescript
if (SKIP_FILES.some(pattern => minimatch(file, pattern))) {
  continue;
}
```

---

**Remember**: These gates protect code quality. Don't bypass them!
