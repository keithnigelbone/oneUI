# AgentPulse — React Native

Animated AI-agent presence indicator. A looping orb that reflects the agent's
conversational state and recolours to the active multi-accent appearance.
Mirrors the web `AgentPulse` component from `@oneui/ui`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `'idle' \| 'listening' \| 'thinking' \| 'speaking'` | `'idle'` | Visual state; plays the matching loop and bridges between states. |
| `appearance` | `ComponentAppearance` | `'auto'` → primary | Color role; recolours the animation at runtime. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| number` | `'md'` | Size preset (maps to dimension f-steps) or a pixel override. |
| `autoTransition` | `boolean` | `true` | Run the bridge animation between states. Set `false` to cut directly. |
| `paused` | `boolean` | `false` | Pause animation playback. |
| `speed` | `number` | `1` | Playback rate (1 = normal, 2 = double, 0.5 = half). |
| `reducedMotionFallback` | `'static' \| 'pulse' \| 'none'` | `'static'` | Behaviour when the user prefers reduced motion. |
| `label` | `string` | auto per state | Overrides the auto-derived accessible label. |
| `aria-live` | `'off' \| 'polite' \| 'assertive'` | `'polite'` | Live-region politeness for screen readers. |
| `testID` | `string` | — | React Native test identifier. |
| `style` | `ViewStyle` | — | Inline layout styles on the wrapper. |

## Code examples

### Basic

```tsx
import { AgentPulse } from '@oneui/ui-native';

<AgentPulse state="listening" />
```

### Driven by conversation state

```tsx
import { useState } from 'react';
import { AgentPulse } from '@oneui/ui-native';

function Assistant() {
  const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  return <AgentPulse state={state} size="lg" appearance="sparkle" />;
}
```

### Inside a Surface (bold background)

```tsx
import { Surface, AgentPulse } from '@oneui/ui-native';

<Surface mode="bold" style={{ padding: 16, borderRadius: 12 }}>
  <AgentPulse state="thinking" appearance="primary" />
</Surface>
```

Inside `<Surface>` the animation recolours via the surface context engine — no
manual color overrides needed.

### Reduced motion

```tsx
// Falls back to a static orb (or a gentle pulse) when the OS requests reduced motion.
<AgentPulse state="speaking" reducedMotionFallback="static" />
```

## Accessibility

Renders with `accessibilityRole="image"` and a live region. The accessible name
resolves from `label` if provided, otherwise a default per state
("Agent is idle / listening / thinking / speaking"). State changes are announced
according to `aria-live` (default `polite`). When the OS requests reduced motion,
`reducedMotionFallback` controls the visual behaviour while the label still
updates.
