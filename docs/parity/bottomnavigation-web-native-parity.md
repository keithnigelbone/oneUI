# BottomNavigation — Web ↔ Native parity

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/BottomNavigation/` | `packages/ui-native/src/components/BottomNavigation/` |
| Items | `BottomNavigationItem` | `BottomNavigationItem.native.tsx` |

## Accessibility

| Topic | Web | Native |
|-------|-----|--------|
| Pattern | Tab list | `accessibilityRole: 'tablist'` on bar |
| Items | `role="tab"`, `aria-selected` | `accessibilityRole` tab + `accessibilityState.selected` on item |
| Name | `aria-label` on nav | Required on `getBottomNavigationAccessibilityProps` |

APG [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) — arrow-key roving focus is a P2 platform enhancement.

Audit: [native-a11y-audit/interactive.md](../native-a11y-audit/interactive.md).
