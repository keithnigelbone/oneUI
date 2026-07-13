# Grid Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Responsive CSS Grid primitive. Column count and gap resolve per-platform via --Grid-Columns and --Grid-Gutter. Children use <Column> with responsive span/start props.
- **Task contexts**: grid, layout, columns, responsive
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **default**: use when Default

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


## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { Grid } from '@oneui/ui';

<Grid />
```

### Recipe Decisions

```json
{
  "component": "Grid",
  "decisions": []
}
```
