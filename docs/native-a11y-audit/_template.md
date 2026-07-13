# Component audit template

Copy this block per component into the section master table.

## Master table row

| Component | APG pattern / ARIA role | Current state | Missing | RN support? | Priority | Owner PR |
| --------- | ----------------------- | ------------- | ------- | ----------- | -------- | -------- |
| _Name_ | _e.g. button_ | _Summary_ | _Gap list_ | _yes / partial / note_ | _P0–P2_ | _branch_ |

## Checklist (answer per component)

### Keyboard navigation

- [ ] Reachable via system focus order (`accessible={true}` on interactive root)
- [ ] Activates with platform default (activate / double-tap)
- [ ] Composite widgets document arrow-key limits (tabs, radio group → OS / future)

### Screen reader

- [ ] `accessibilityLabel` or visible text provides name
- [ ] `accessibilityRole` matches APG
- [ ] `accessibilityState` exposes disabled, busy, selected, checked, expanded as applicable
- [ ] `accessibilityHint` forwarded when prop exists
- [ ] Decorative children hidden (`accessible={false}`)

### Focus management

- [ ] Focus order follows visual order
- [ ] Modals: N/A until Dialog ships
- [ ] Focus ring: P2 platform default (no token halo on RN yet)

### Color and contrast

- [ ] Text/UI pairs use `useSurfaceTokens` role tokens (engine validates AA on web; same tokens on native)
- [ ] Verified on default surface and inside `<Surface mode="bold">` in showcase

### Touch targets

- [ ] Interactive hit area ≥ `touchTarget.min` (44px default) via container size or `hitSlop`

### State communication

- [ ] Disabled / loading / selected / checked / indeterminate exposed in `accessibilityState`

### Error handling

- [ ] `aria-invalid` + description association (Input stack)
- [ ] Live region for dynamic errors (InputFeedback)

### Alternative text

- [ ] Icons: `aria-label` or derived catalog name
- [ ] Images: `alt` / `accessibilityLabel`
- [ ] Decorative: hidden from tree

## Implementation notes

```ts
// Preferred pattern (playbook §3.3)
const a11y = getMyComponentAccessibilityProps(props, state);
return <Pressable {...a11y} />;
```
