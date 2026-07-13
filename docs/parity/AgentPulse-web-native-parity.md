# AgentPulse: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

This document compares the **React (web)** and **React Native** AgentPulse implementations, explains how animations and state transitions are handled on both platforms, and lists intentional differences.

**Primary sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/AgentPulse/AgentPulse.tsx` | `packages/ui-native/src/components/AgentPulse/AgentPulse.native.tsx` |
| Layout / static visuals | `packages/ui/src/components/AgentPulse/AgentPulse.module.css` | `packages/ui-native/src/components/AgentPulse/AgentPulse.styles.native.ts` |
| Shared props / state | `packages/ui/src/components/AgentPulse/AgentPulse.shared.ts` | `packages/ui-native/src/components/AgentPulse/interface.ts` (manually aligned) |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Prop contract** | **Aligned** | `state`, `appearance`, `size`, `autoTransition`, `paused` are parity. |
| **States** | **Aligned** | Both support `idle`, `listening`, `thinking`, `speaking`. |
| **Animations** | **Approximated** | Web uses CSS keyframes. Native uses `Animated` API. |
| **Transitions** | **Aligned** | Both handle `idle → listening` and `listening → thinking` bridge phases. |
| **Sizes** | **Aligned** | `sm` (Spacing-5), `md` (Spacing-7), `lg` (Spacing-9), `xl` (Spacing-12) are parity. |
| **Reduced Motion** | **Aligned** | Both support `static` and `pulse` fallbacks via `useReduceMotion`. |
| **Accessibility** | **Aligned** | Both use `role="status"` and `aria-live` for state announcements. |

---

## 2. Token mapping (web CSS → native)

| Property | Web CSS Variable | Native Token | Default |
|----------|------------------|--------------|---------|
| Size (sm) | `--Spacing-5` | `tokens.spacing['5']` | `14px` |
| Size (md) | `--Spacing-7` | `tokens.spacing['7']` | `24px` |
| Size (lg) | `--Spacing-9` | `tokens.spacing['9']` | `40px` |
| Size (xl) | `--Spacing-12` | `tokens.spacing['12']` | `80px` |
| Color | `--{Appearance}-Bold` | `role.surfaces.default` (role resolved) | `Primary-Bold` |
| Pulse Duration | `--Motion-Duration-3XL` | `tokens.motion.duration.expressive.long` | `1200ms` |

---

## 3. Implementation differences

### 3.1 Animation Engine

- **Web**: Driven entirely by CSS keyframes on SVG elements. Leverages `offset-path` for complex morphing.
- **Native**: Driven by React Native's `Animated` API. `offset-path` is approximated using interpolated `x`, `y`, `width`, and `height` properties on `react-native-svg` components.

### 3.2 Real-time Audio

- **Web**: Subscribes to `agentPulseAudio.ts` which uses Web Audio API to drive height/scale.
- **Native**: Infrastructure provided for `listening` and `speaking` scale/height animations, but requires integration with native audio amplitude sources which are platform-specific.

### 3.3 Intersection Observer

- **Web**: Uses `IntersectionObserver` to pause animations when off-screen.
- **Native**: Currently runs animations while mounted (simplified for v1).

---

## 4. Showcase map

| Web story | Native showcase section | Status |
|-----------|-------------------------|--------|
| `Default` | `AgentPulseStates` | **Aligned** |
| `Sizes` | `AgentPulseSizes` | **Aligned** |
| `Appearances` | `AgentPulseAppearances` | **Aligned** |
| `Surface Context` | `AgentPulseSurfaceContext` | **Aligned** |
| `State Loop` | `AgentPulseTransitions` | **Aligned** |
