# Logo Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: A visual mark that identifies and reinforces brand identity throughout the interface. Transparent size container — the SVG content controls its own shape and colors. Inside a BrandProvider, `<Logo alt="…" />` renders the active brand's logo automatically; pass children / svgContent / src only to override it.
- **Task contexts**: brand, identity, mark, wordmark, image
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: children
- **Forbids**: 

## Variant Logic

- **mark**: use when Mark
- **full**: use when Full

## Relationships and Dependencies

- **Related**: 
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark

## Observability Hooks

- **Track**: 
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `alt` | `string` | Yes | - | Accessible alt text describing the brand (required) |
| `children` | `ReactNode` | No | - | Logo content as React node (SVG element, icon, etc.) — highest priority |
| `className` | `string` | No | - | Additional class name |
| `customSize` | `number` | No | - | Custom size in pixels (only when size='custom') |
| `fallback` | `ReactNode` | No | - | Fallback content when src fails to load |
| `material` | `LogoMaterial` | No | - | Metallic material paint for inline SVG content. Raster src logos are unchanged. |
| `materialGradientAngle` | `number` | No | - | Gradient direction angle used by the metallic SVG paint server. Defaults to 135. |
| `materialGradientType` | `MetallicGradientType` | No | - | Gradient style used by the metallic SVG paint server. Defaults to linear. |
| `materialTarget` | `LogoMaterialTarget` | No | - | SVG paint channels that receive the metallic material. Default: fill-stroke |
| `onError` | `() => void` | No | - | Image error callback (src mode only) |
| `onLoad` | `() => void` | No | - | Image load callback (src mode only) |
| `size` | `LogoSize` | No | - | Size preset. Default: 'm' |
| `src` | `string` | No | - | Image source URL for raster/external logos |
| `style` | `CSSProperties` | No | - | Inline styles |
| `svgContent` | `string` | No | - | Raw SVG markup string (e.g., from Convex brand.logoSvg) |
| `variant` | `LogoVariant` | No | - | Circular mark or full rectangular wordmark. Default: 'mark' |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
| `children` |  |  |

## Code Snippets

### Basic Usage

```tsx
import { Logo } from '@oneui/ui';

<Logo />
```

### Recipe Decisions

```json
{
  "component": "Logo",
  "decisions": []
}
```
