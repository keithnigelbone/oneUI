/**
 * Image.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/Image/Image.module.css`.
 *
 * Mapping ↔ Image.module.css:
 *   .root         → styles.container (overflow: hidden, borderRadius: Shape-0)
 *   .root img     → styles.inner (width/height 100%)
 *   .root[data-interactive='true']:active → styles.pressed
 *   --Image-disabledOpacity → DISABLED_OPACITY
 *   --Image-pressedOpacity → PRESSED_OPACITY
 *
 * Web's container is `transparent` until the image loads; the fallback
 * branch paints `var(--Image-fallbackBackground, var(--Neutral-Minimal))`.
 * Native mirrors this — `useSurfaceTokens('neutral').surfaces.minimal` is the
 * brand-resolved equivalent of `--Neutral-Minimal`.
 */

import { StyleSheet } from 'react-native';

// INTENTIONAL-LITERAL: matches `--Image-disabledOpacity` / `--Image-pressedOpacity`
// fallbacks in Image.module.css (`var(--Disabled-Opacity, 0.5)` / pressed 0.85).
export const DISABLED_OPACITY = 0.5;
export const PRESSED_OPACITY = 0.85;

export const styles = StyleSheet.create({
  // .root — `border-radius: var(--Shape-0)` = 0 on web.
  container: {
    overflow: 'hidden',
    borderRadius: 0,
  },
  // .root img — inner image fills the container.
  inner: { width: '100%', height: '100%' },
  // .root[data-interactive='true']:active overlay (web uses bg state layer;
  // native simulates with an opacity nudge on the press).
  pressed: { opacity: PRESSED_OPACITY },
});
