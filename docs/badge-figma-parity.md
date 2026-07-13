# Badge family — Figma parity matrix

Source of truth: Figma file `kwE8QTskm5AgYoDZOB5FgO/Nuno`, frame `409:10060`
(full Badge matrix, all sizes × attentions × slot combinations).

Pulled via Figma MCP on 2026-04-24 and re-verified 2026-04-24 against
canonical size-variant nodes (see "Reference nodes" below). All rows are
aligned — status column reflects `Badge.module.css:189-262`. All pixel
values are the default L breakpoint; compact/open density re-derive via
the dimension f-step cascade — nothing here needs an absolute override.

## Figma token → our token mapping

| Figma token | px (default platform) | Our token |
| --- | --- | --- |
| `dimensions/spacings/0` | 0 | `Spacing-0` |
| `dimensions/spacings/0,5` | 2 | `Spacing-0-5` / `Shape-0-5` / `Dimension-f-7` |
| `dimensions/spacings/1` | 4 | `Spacing-1` / `Shape-1` / `Dimension-f-6` |
| `dimensions/spacings/1,5` | 6 | `Spacing-1-5` / `Shape-1-5` / `Dimension-f-5` |
| `dimensions/spacings/2` | 8 | `Spacing-2` / `Shape-2` / `Dimension-f-4` |
| `dimensions/spacings/2,5` | 10 | `Spacing-2-5` / `Shape-2-5` / `Dimension-f-3` |
| `dimensions/spacings/3` | 12 | `Spacing-3` / `Shape-3` / `Dimension-f-2` |
| `dimensions/shape/1` | 4 | `Shape-1` |
| `dimensions/shape/1,5` | 6 | `Shape-1-5` |
| `dimensions/shape/2` | 8 | `Shape-2` |
| `dimensions/shape/2,5` | 10 | `Shape-2-5` |
| `typography/fontsize/system/3xs` | 8 | `Label-3XS-FontSize` |
| `typography/fontsize/system/2xs` | 10 | `Label-2XS-FontSize` |
| `typography/fontsize/system/xs` | 12 | `Label-XS-FontSize` |
| `typography/fontsize/system/s` | 14 | `Label-S-FontSize` |
| `typography/fontsize/system/m` | 16 | `Label-M-FontSize` |
| `colour/surface` (bold fill) | per role | `--{Role}-Bold` (+ root-only `--{Role}-Fill-Bold`) |
| `colour/on-colour/high` (on-bold text) | per role | `--{Role}-Bold-High` (+ root-only `--{Role}-Fill-Bold-High`) |
| `colour/on-colour/tinted` (on-bold tinted icon) | per role | `--{Role}-Bold-Tinted` (+ root-only `--{Role}-Fill-Bold-Tinted`) |

## Badge — size × slot matrix

| Size | Metric | Figma | Our token | Current CSS value | Status |
| --- | --- | --- | --- | --- | --- |
| xs | height | 12 | `Spacing-3` | 12 | ✓ |
| xs | pad (no slot) | 4 | `Spacing-1` | 4 | ✓ |
| xs | pad (slot side) | 2 | `Spacing-0-5` | 2 | ✓ |
| xs | gap | 2 | `Spacing-0-5` | 2 | ✓ |
| xs | py | 2 | `Spacing-0-5` | n/a (height-driven) | ✓ |
| xs | radius | 4 | `Shape-1` | 4 | ✓ |
| xs | font-size | Label-3XS (8) | `Label-3XS-FontSize` | Label-3XS | ✓ |
| xs | icon size | 8 | `Spacing-2` | 8 (slot auto-size) | ✓ |
| s | height | 16 | `Spacing-4` | 16 | ✓ |
| s | pad (no slot) | 4 | `Spacing-1` | 4 | ✓ |
| s | pad (slot side) | 2 | `Spacing-0-5` | 2 | ✓ |
| s | gap | 2 | `Spacing-0-5` | 2 | ✓ |
| s | radius | 4 | `Shape-1` | 4 | ✓ |
| s | font-size | Label-2XS (10) | `Label-2XS-FontSize` | Label-2XS | ✓ |
| s | icon size | 12 | `Spacing-3` | 12 (slot auto-size) | ✓ |
| m | height | 20 | `Spacing-5` | 20 | ✓ |
| m | pad (no slot) | 6 | `Spacing-1-5` | 6 | ✓ |
| m | pad (slot side) | 4 | `Spacing-1` | 4 | ✓ |
| m | gap | 4 | `Spacing-1` | 4 | ✓ |
| m | radius | 6 | `Shape-1-5` | 6 | ✓ |
| m | font-size | Label-XS (12) | `Label-XS-FontSize` | Label-XS | ✓ |
| m | icon size | 12 | `Spacing-3` | 12 (slot auto-size) | ✓ |
| l | height | 24 | `Spacing-6` | 24 | ✓ |
| l | pad (no slot) | 8 | `Spacing-2` | 8 | ✓ |
| l | pad (slot side) | 4 | `Spacing-1` | 4 | ✓ |
| l | gap | 4 | `Spacing-1` | 4 | ✓ |
| l | radius | 8 | `Shape-2` | 8 | ✓ |
| l | font-size | Label-S (14) | `Label-S-FontSize` | Label-S | ✓ |
| l | icon size | 16 | `Spacing-4` | 16 (slot auto-size) | ✓ |
| xl | height | 32 | `Spacing-8` | 32 | ✓ |
| xl | pad (any) | 6 | `Spacing-1-5` | 6 | ✓ |
| xl | gap | 6 | `Spacing-1-5` | 6 | ✓ |
| xl | py | 4 | `Spacing-1` | n/a (height-driven) | ✓ |
| xl | radius | 10 | `Shape-2-5` | 10 | ✓ |
| xl | font-size | Label-M (16) | `Label-M-FontSize` | Label-M | ✓ |
| xl | icon size | 20 | `Spacing-5` | 20 (slot auto-size) | ✓ |

**Reference nodes** (Figma `node-id` = sample data source):
- xs: `417:11175` (no slot), `417:11184` (end slot M)
- s: `417:11127` (no slot), `417:11132` (both slots M)
- m: `414:11037` (no slot), `414:11044` (both slots M)
- l: `409:10262` (no slot), `409:10283` (start slot M)
- xl: `409:10070` (no slot), `409:10118` (both slots M)

## Slot child — auto-sized per badge size

| Badge size | Icon | Avatar | CounterBadge | IndicatorBadge (Figma node) |
| --- | --- | --- | --- | --- |
| xs | 8 | 8 (`2xs`) | — (12 min-width overflows) | 4 (`417:11340`) |
| s | 12 | 12 (`xs`) | 12 (`xs`) | 6 (`417:11337`) |
| m | 12 | 12 (`xs`) | 12 (`xs`) | 8 (`417:11334`) |
| l | 16 | 16 (`s`) | 16 (`m`) | 8 (`417:11331`) |
| xl | 20 | 20 (`m`) | 20 (`l`) | 12 (`417:11321`) |

*IndicatorBadge + CounterBadge rows pending a final Figma MCP sweep — will be
populated during CounterBadge/IndicatorBadge audit. XS+IndicatorBadge=4 is
confirmed from node `7081:8357`.*

## Avatar in slot

Avatar keeps its native per-size icon proportions inside Badge slots — no
icon-size override. The Badge simply remaps Avatar's default size (`m`) to
the Figma-prescribed Avatar size via `--Avatar-size-m: var(--_slot-avatar-size)`
in the `.start, .end` block. At xs Badge the Avatar lands at `2xs` (8px,
filled-icon per Figma node `7081:8357`); everywhere else it resolves to
`xs/s/m` using Avatar's own token defaults.

## On-colour resolution (reaffirming last pass)

Badge root sets `color: var(--_bg-bold-high)` → root `--Primary-Bold-High`
= near-white. Slot spans set `data-surface="bold"|"subtle"`. Slot overrides
redirect `--Neutral-High`/`--Primary-High`/`--Text-High` → `--_bg-icon-on-bold`
(= root-only `--{Role}-Fill-Bold-High` = near-white, matches label) on bold,
and → `--_bg-icon-on-subtle` (= root-only `--{Role}-Fill-Subtle-TintedA11y` =
deep branded, matches subtle label) on subtle. Avatar in the same slot reads
its own `Bold-Tinted` / `Bold-TintedA11y` tokens, context-remapped by the
slot's `[data-surface]` block.

Source: `docs/on-colour-token-mapping.md` (written in the previous pass).
