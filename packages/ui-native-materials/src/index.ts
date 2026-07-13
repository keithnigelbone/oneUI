/**
 * @oneui/ui-native-materials
 *
 * Material surface effects for React Native — split out of `@oneui/ui-native`
 * to keep the canonical primitives package free of native-module peer
 * dependencies. Components here lean on `expo-blur` + `expo-linear-gradient`,
 * which are not part of the OneUI brand cascade and don't fit the build-time
 * StyleSheet pattern used by the Wave-1 primitives.
 *
 * - TranslucentView: Simple opacity overlays
 * - FrostedView: Blur-based glass effects (expo-blur)
 * - GlassView: Advanced glass with tint (Liquid Glass)
 * - MetallicView: Gradient-based metallic surfaces (expo-linear-gradient)
 */

/**
 * @deprecated No longer needed. Metallic gradients are now built into
 * `@oneui/ui-native` via `react-native-svg` — no registration required.
 * This function is a no-op and will be removed in a future release.
 */
export function initOneUIMaterials(): void {
  // no-op — built-in SVG renderer in @oneui/ui-native handles metallic gradients
}

export {
  TranslucentView,
  type TranslucentViewProps,
  type TranslucentTint,
  type TranslucentIntensity,
  FrostedView,
  type FrostedViewProps,
  type FrostedTint,
  type FrostedIntensity,
  GlassView,
  type GlassViewProps,
  type GlassVariant,
  type GlassTint,
  MetallicView,
  getMetallicTextColor,
  type MetallicViewProps,
  type MetallicType,
} from './components';
