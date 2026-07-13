# Modal: Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

This document compares the **React (web)** and **React Native** Modal implementations, explains how the shared behavior is maintained, and lists any intentional or remaining differences.

**Primary sources**

| Area | Web | Native |
|------|-----|--------|
| Component | `packages/ui/src/components/Modal/Modal.tsx` | `packages/ui-native/src/components/Modal/Modal.native.tsx` |
| Layout / static visuals | `packages/ui/src/components/Modal/Modal.module.css` | `packages/ui-native/src/components/Modal/Modal.styles.native.ts` |
| Shared props / state | `packages/ui/src/components/Modal/Modal.shared.ts` | `packages/ui-native/src/components/Modal/interface.ts` (mirrored logic) |
| Theme / surface | Injected CSS + `[data-surface]` | `Surface`, `useSurfaceTokens`, `useOneUITheme` |

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Prop contract** | **Aligned** | Standardized `ModalProps` and `useModalState` logic mirrored from web. |
| **Sizes (S / M / L / FullWidth)** | **Aligned** | Same 4-tier width and max-height logic (approximated for native). |
| **Header alignment** | **Aligned** | Left/Center alignment supported on both platforms. |
| **Footer orientation** | **Aligned** | Horizontal/Vertical stacking supported. |
| **Dividers (onScroll)** | **Aligned** | Scroll-based visibility for top/bottom dividers implemented via `onScroll`. |
| **Backdrop / Dismissal** | **Aligned** | `dismissible` controls outside-press and Escape/Back-button behavior. |
| **Typography** | **Aligned** | Web Title-M/Body-S maps to native typography tokens. |
| **Accessibility** | **Aligned** | WCAG labels and roles (dialog/alertdialog) mapped to RN equivalents. |
| **Surface context** | **Aligned** | Uses `Elevated` surface role by default on both platforms. |
| **Primitive** | **Different** | Web: `@base-ui/react` `Dialog`. Native: RN `Modal` + `ScrollView`. |

---

## 2. Shared Behavior and State

### 2.1 `useModalState`

- **Resolved Size**: Defaults to `M`.
- **Visibility Gates**: `showHeader`, `showTitle`, `showDescription`, `showFooter` derived from presence of props.
- **Divider Behavior**: `dividerTopVisibility`, `dividerBottomVisibility`, and scroll positions are normalized.

### 2.2 Scroll-based Dividers

Both platforms implement "onScroll" dividers:
- **Top Divider**: Appears when the user scrolls down (beyond 'middle' or 'start' threshold).
- **Bottom Divider**: Stays visible until the user scrolls to the end.
- **Native Implementation**: Uses `onScroll` event from `ScrollView` to track `scrollState` ('start', 'middle', 'end', 'fits').

---

## 3. Implementation Details

### 3.1 Styling

- **Web**: Uses CSS Modules (`Modal.module.css`) with intermediate variables for padding and gaps.
- **Native**: Uses `StyleSheet.create` with OneUI tokens (`tokens.spacing['4']`, etc.).
- **Popup Container**: Inlined `backgroundColor: elevatedRole` and `borderRadius: theme.shape['4']` to ensure theme reactivity and Android clipping.

### 3.2 Layout Mapping

| Section | Web (CSS) | Native (StyleSheet) |
|---------|-----------|----------------------|
| Header | `padding: 16`, `min-height: 56` | `padding: tokens.spacing['4']`, `minHeight: tokens.spacing['14']` |
| Body | `padding-v: 12`, `padding-h: 16` | `paddingVertical: tokens.spacing['3']`, `paddingHorizontal: tokens.spacing['4']` |
| Footer | `padding: 16`, `gap: 8` | `padding: tokens.spacing['4']`, `gap: tokens.spacing['2']` |

---

## 4. Intentional Differences

### 4.1 Max-height Logic
- **Web**: Uses `vh` units in CSS (S=50vh, M=70vh, L=85vh).
- **Native**: Uses percentage strings in `POPUP_SIZE` (S='50%', M='70%', L='85%'). `FullWidth` uses '90%' to leave room for margins.

### 4.2 Backdrop
- **Web**: Styled via `.backdrop` class with `var(--Scrim)`.
- **Native**: Wrapped `Pressable` with `theme.tokens.color.scrim`.

### 4.3 Animation
- **Web**: Uses Base UI entry/exit transitions with motion easing tokens.
- **Native**: Uses `RNModal`'s built-in `animationType="fade"`.

---

## 5. Accessibility Mapping

| Web (Base UI / ARIA) | Native (RN) |
|----------------------|-------------|
| `role="dialog"` | `accessibilityRole="alertdialog"` |
| `aria-label` | `accessibilityLabel` |
| `aria-labelledby` | Handled by fallback to `title` in `getModalAccessibilityProps` |
| `aria-modal="true"` | `accessibilityModal={true}` |
| Focus trap | Built-in to `RNModal` |

---

*Generated from parity audit of Modal component.*
