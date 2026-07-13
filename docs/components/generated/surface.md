# Surface Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Container primitive that opts descendants into the OneUI surface cascade via [data-surface]. The `mode` prop maps to one of the 8 canonical surface tokens (default/ghost/minimal/subtle/moderate/bold/elevated/blend). Optional transparent material composites over arbitrary media.
- **Task contexts**: surface, container, layout, context, background
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **default**: use when Default
- **ghost**: use when Ghost
- **minimal**: use when Minimal
- **subtle**: use when Subtle
- **moderate**: use when Moderate
- **bold**: use when Bold
- **elevated**: use when Elevated
- **blend**: use when Blend

## Relationships and Dependencies

- **Related**: 
- **Escalates to**: -
- **Degrades to**: -
- **Groups with**: -

## Context Signals

- **Density**: compact, default, open
- **Modality**: desktop, mobile
- **Brand**: theme-scope aware, recipe-driven
- **Mode**: light, dark, surface-context

## Observability Hooks

- **Track**: 
- **Health**: a11y_violations

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |


## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Surface } from '@oneui/ui';

<Surface />
```

### Recipe Decisions

```json
{
  "component": "Surface",
  "decisions": [
    "Interior padding"
  ]
}
```
