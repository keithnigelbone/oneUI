// Static Convex / motion primitives used when `--Motion-*` is absent from
// `designSystem.componentCustomProperties` and dimension contexts — aligns with
// `packages/shared/src/utils/motion.ts` default scale (Moderate‑M ≈200ms base 300),
// easing strings, and `Button.module.css` tap-scale `%` substitution fallbacks.

/// Returns a concrete CSS value for well-known `--Motion-*` keys, else null.
String? convexMotionCSSValue(String normalizedVarName) {
  switch (normalizedVarName) {
    case '--Motion-Duration-S':
      return '135ms';
    case '--Motion-Duration-M':
      return '200ms';
    case '--Motion-Duration-L':
      return '300ms';
    case '--Motion-Duration-XL':
      return '450ms';
    case '--Motion-Duration-3XL':
      return '1015ms';
    case '--CircularProgressIndicator-trimDuration':
      return '1500ms';
    case '--CircularProgressIndicator-rotateDuration':
      return '6000ms';
    case '--Motion-Offset-L':
      return '90ms';
    case '--Motion-Easing-Transition-Moderate':
      return 'cubic-bezier(0.5, 0, 0.3, 1)';
    case '--Motion-Easing-Entrance-Moderate':
      return 'cubic-bezier(0.25, 0.8, 0.5, 1)';
    case '--Motion-Easing-Exit-Moderate':
      return 'cubic-bezier(0.7, 0.1, 0.9, 0.7)';
    case '--Motion-Tap-Scale-XS':
    case '--Motion-Tap-Scale-Up':
      return '7';
    case '--Motion-Tap-Scale-Default':
      return '3';
    case '--Motion-Tap-Scale-FullWidth':
      return '1';
    case '--Motion-Duration-Discreet-Medium':
      return '150ms';
    case '--Motion-Easing-Standard':
      return 'cubic-bezier(0.4, 0, 0.2, 1)';
    default:
      return null;
  }
}
