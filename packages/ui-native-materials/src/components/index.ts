/**
 * Materials Components for React Native
 *
 * Provides material surface effects:
 * - TranslucentView: Simple opacity overlays
 * - FrostedView: Blur-based glass effects (expo-blur)
 * - GlassView: Advanced glass with tint (Liquid Glass)
 * - MetallicView: Gradient-based metallic surfaces (expo-linear-gradient)
 */

export {
  TranslucentView,
  type TranslucentViewProps,
  type TranslucentTint,
  type TranslucentIntensity,
} from './TranslucentView.native';

export {
  FrostedView,
  type FrostedViewProps,
  type FrostedTint,
  type FrostedIntensity,
} from './FrostedView.native';

export {
  GlassView,
  type GlassViewProps,
  type GlassVariant,
  type GlassTint,
} from './GlassView.native';

export {
  MetallicView,
  getMetallicTextColor,
  type MetallicViewProps,
  type MetallicType,
} from './MetallicView.native';
