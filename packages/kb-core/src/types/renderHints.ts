/**
 * Per-SDK render hints. JDS owns the SHAPE here; per-component VALUES live
 * in each @jds/kb-<sdk> package and may be authored by JDS or contributed by
 * downstream tooling teams.
 *
 * Hints are advisory — they describe what idiomatic output looks like for
 * each SDK target so consumers can score "is the generated code idiomatic
 * for this SDK?" without re-deriving conventions every time.
 */

// ---------------------------------------------------------------------------
// Web
// ---------------------------------------------------------------------------

export interface RenderHintsWeb {
  /** Base DOM element for the component root. */
  readonly baseElement: 'button' | 'a' | 'div' | 'span' | 'input' | 'select' | 'textarea' | 'label' | 'fieldset';
  /** Base UI primitive the component is built on (or 'none' for pure DOM). */
  readonly baseUiPrimitive: string | 'none';
  /** Whether the component carries CSS module classes by convention. */
  readonly hasCssModule: boolean;
  /** Whether the component participates in [data-surface] cascade as a root. */
  readonly emitsDataSurface: boolean;
}

// ---------------------------------------------------------------------------
// React Native
// ---------------------------------------------------------------------------

export interface RenderHintsRN {
  /** Base RN primitive for the component root. */
  readonly baseElement:
    | 'Pressable' | 'TouchableOpacity' | 'TouchableHighlight' | 'View' | 'Text' | 'Image'
    | 'ScrollView' | 'FlatList' | 'SectionList' | 'TextInput';
  /** Which interactions trigger an animated transition. */
  readonly animatedOn: readonly ('press' | 'focus' | 'hover' | 'mount')[];
  /** Whether the component reads from `useReduceMotion`. */
  readonly honorsReduceMotion: boolean;
  /** Whether the component reads from a parent <Surface> context. */
  readonly readsFromSurfaceContext: boolean;
}

// ---------------------------------------------------------------------------
// iOS (SwiftUI primary, UIKit fallback)
// ---------------------------------------------------------------------------

export interface RenderHintsIos {
  readonly framework: 'SwiftUI' | 'UIKit' | 'both';
  readonly swiftUiBase?: string;     // e.g. 'Button', 'Label', 'Image', 'Text', 'HStack'
  readonly uiKitBase?: string;       // e.g. 'UIButton', 'UIImageView'
  readonly buttonStyle?: string;     // a custom SwiftUI ButtonStyle name
  readonly modifiers: readonly string[];   // canonical modifier chain, e.g. ['.padding', '.background', '.cornerRadius']
}

// ---------------------------------------------------------------------------
// Android (Jetpack Compose primary)
// ---------------------------------------------------------------------------

export interface RenderHintsAndroid {
  readonly framework: 'Compose' | 'Views';
  readonly composable?: string;      // e.g. 'Button', 'Text', 'Image'
  readonly viewClass?: string;       // when framework === 'Views'
  readonly modifierChain: readonly string[];   // e.g. ['Modifier.clickable', 'Modifier.padding']
}

// ---------------------------------------------------------------------------
// Flutter
// ---------------------------------------------------------------------------

export interface RenderHintsFlutter {
  readonly widget: string;           // e.g. 'ElevatedButton', 'Text', 'Container'
  readonly stateful: boolean;
  readonly themeExtension: string;   // e.g. 'JDSButtonTheme'
}
