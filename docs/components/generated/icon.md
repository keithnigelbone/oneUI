# Icon Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Render a semantic or custom icon with configurable size, colour role, and emphasis level.
- **Task contexts**: inline-decoration, button-icon, status-indicator, navigation-icon
- **Sentiments**: neutral, positive, negative, warning, informative

## Composition Rules

- **Requires**: icon prop (semantic name or React element)
- **Allows**: aria-label for non-decorative use
- **Forbids**: interactive behaviour (use IconButton instead), text content

## Variant Logic

- **high emphasis**: use when primary content icon requiring strongest contrast
- **medium emphasis**: use when secondary or supporting icon
- **low emphasis**: use when subtle decorative icon

## Relationships and Dependencies

- **Related**: IconButton, IconContained, Button
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: 
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | `ComponentIconInput | ReactElement` | Yes | - | Icon to display — semantic name, pack id, component, or React element |
| `appearance` | `IconAppearance` | No | - | Colour role. Omitted → slot parent → nearest Surface → neutral. |
| `aria-hidden` | `boolean` | No | - | Whether icon is hidden from assistive technology. Default: true (decorative) |
| `aria-label` | `string` | No | - | Accessible label — if provided, icon is not decorative |
| `className` | `string` | No | - | Additional class name |
| `data-testid` | `string` | No | - | QA / Playwright hook — forwarded to the root span |
| `emphasis` | `IconEmphasis` | No | - | Colour emphasis level. Default: 'high' |
| `size` | `IconSize` | No | - | Size preset (spacing index). Default: '5' (20px) |
| `style` | `CSSProperties` | No | - | Inline styles |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Icon } from '@oneui/ui';

<Icon icon="check" />
```

### With Appearance

```tsx
<Icon icon="warning" appearance="negative" emphasis="high" size="7" />
```
