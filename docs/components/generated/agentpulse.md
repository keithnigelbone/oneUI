# AgentPulse Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: Animated brand-coloured indicator that visualises the four canonical agent states (idle, listening, thinking, speaking) using the OneUI logo geometry. Recolours per brand and adapts on coloured surfaces.
- **Task contexts**: ai, agent, thinking, listening, speaking, lottie, animated, status, voice
- **Sentiments**: neutral

## Composition Rules

- **Requires**: 
- **Allows**: 
- **Forbids**: 

## Variant Logic

- **idle**: use when Idle
- **listening**: use when Listening
- **thinking**: use when Thinking
- **speaking**: use when Speaking

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
| `appearance` | `ComponentAppearance` | No | - | Multi-accent appearance role. Recolours the Lottie at runtime. |
| `aria-live` | `'off' | 'polite' | 'assertive'` | No | - | Live region politeness for screen readers. |
| `autoTransition` | `boolean` | No | - | Skip the bridge animation between states. |
| `className` | `string` | No | - | className property |
| `label` | `string` | No | - | Override the auto-derived a11y label (e.g. "Agent is thinking"). |
| `paused` | `boolean` | No | - | Pause animation playback. |
| `reducedMotionFallback` | `AgentPulseReducedMotionFallback` | No | - | Reduced-motion fallback. |
| `size` | `AgentPulseSize | number` | No | - | Size preset (maps to dimension f-step tokens) or pixel override. |
| `speed` | `number` | No | - | Playback rate (1 = normal, 2 = double, 0.5 = half). |
| `state` | `AgentPulseState` | No | - | Visual state. Component plays the matching loop and auto-runs a bridge animation between states when one exists. |
| `style` | `CSSProperties` | No | - | style property |

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |


## Code Snippets

### Basic Usage

```tsx
import { AgentPulse } from '@oneui/ui';

<AgentPulse />
```
