# Header — Native (Figma) vs Web parity

> **Native source of truth:** Figma OneUI Micropatterns — `HeaderNative` family  
> Web reference: `packages/ui/src/components/WebHeader/` (`WebHeader` export)

## Figma nodes

| Component | Node | API properties |
| --------- | ---- | -------------- |
| `HeaderNative` | `2134:15129` | `expanded`, `secondaryNav`, `divider` |
| `HeaderNative.PrimaryNav` | `2134:13491` | `type`, `expanded`, `start`, `end`, `endActions`, `avatar`, `secondaryText` |
| `HeaderNative.SecondaryNav` | `2134:14646` | Visibility gated by root `secondaryNav` |

## Native API (`@oneui/ui-native`)

```tsx
const [active, setActive] = useState('overview');

<HeaderNative expanded secondaryNav divider aria-label="App header">
  <PrimaryNav
    type="homeBar"
    start
    end
    avatar
    endActions="IconButton"
    startSlot={<Logo />}
    endSlot={<Actions />}
    avatarSlot={<Avatar />}
  />
  <SecondaryNav aria-label="Section tabs">
    {['overview', 'features', 'pricing'].map((tab) => (
      <HeaderItem
        key={tab}
        value={tab}
        attention="medium"
        active={active === tab}
        onPress={() => setActive(tab)}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </HeaderItem>
    ))}
  </SecondaryNav>
</HeaderNative>
```

### Intentional differences from WebHeader

| Web-only (not in Figma native) | Native replacement |
| ------------------------------ | ------------------ |
| `variant` (transparent, glass, hidden, stickyHidden) | Page/surface composition via `<Surface>` |
| `breakpoint`, responsive hamburger | Explicit `start` / `end` slot booleans |
| `middle` (fluid / centred / none) | Layout derived from `type` |
| `PrimaryNav` + `HeaderItem` children (homeBar centre tabs, `activeValue`) | **`HeaderItem` in `SecondaryNav` only** — consumer tracks `active` per item |
| `searchInput` position | `type="searchBar"` + `expanded` |
| `showMenuButton`, `MobileDrawer` | Not in micropattern — use app navigation |
| `SecondaryNav.type` (navStart, marketing) | Single row; children only |
| `HeaderItem.href` / `onClick` | `onPress` only |

### Shared with web

| Feature | Web | Native |
| ------- | --- | ------ |
| `HeaderItem.attention` (`low` / `medium` / `high`) | ✓ | ✓ |
| `HeaderItem` slots (`start` / `end`, sizes) | ✓ | ✓ |
| `PrimaryNavType` (`homeBar`, `contextBar`, `searchBar`) | ✓ | ✓ |
| Active tab indicator | ✓ (PrimaryNav middle) | ✓ (`SecondaryNav` + `HeaderItem`) |
| `secondaryText` on contextBar | — | ✓ (Figma) |

## Accessibility

Helpers in `interface.ts`: `getHeaderAccessibilityProps`, `getPrimaryNavAccessibilityProps`, `getSecondaryNavAccessibilityProps`, `getHeaderItemAccessibilityProps`.

## Showcase matrices (`HeaderNative.showcase.native.tsx`)

| Matrix | Covers |
| ------ | ------ |
| `HeaderFigmaHomeBarDesign` | Default `homeBar` |
| `HeaderPrimaryNavTypes` | `type` × slot content |
| `HeaderPrimaryNavExpanded` | `expanded`, `divider`, collapsed search |
| `HeaderComposedWithSecondary` | `secondaryNav=true` |
| `HeaderItemAttentionMatrix` | Item attention levels |
| `HeaderItemSlotMatrix` | Item slots |
| `HeaderItemInteractionStates` | Active switching |
| `HeaderOnBoldSurface` | Surface context |
