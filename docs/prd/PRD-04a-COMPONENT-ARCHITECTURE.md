# One UI Studio — Component Architecture PRD

> **Version**: 1.0.0
> **Last Updated**: January 2026
> **Status**: Draft
> **Parent**: [Components PRD](./PRD-04-COMPONENTS.md)

---

## Executive Summary

This PRD defines the technical architecture for building components in One UI Studio. It covers Base UI integration, code generation, file structure, platform parity (React Web + React Native), testing, accessibility, performance, and AI-ready documentation.

### Core Principles

1. **Base UI Foundation**: All components extend Base UI primitives without forking
2. **Zero Literals**: Every visual value comes from foundation tokens
3. **Platform Parity**: React Web and React Native share identical APIs
4. **WCAG AA**: Mandatory accessibility compliance
5. **Performance**: <5KB per component, <16ms render time
6. **AI-Ready**: Structured documentation for LLM consumption

---

## A1: Base UI Integration

### A1.1 Composition Model

Components MUST extend Base UI primitives through composition, not modification.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT COMPOSITION                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │   Base UI       │    │   One UI        │    │   Brand         │     │
│  │   Primitive     │ ─► │   Wrapper       │ ─► │   Instance      │     │
│  │                 │    │                 │    │                 │     │
│  │ • Accessibility │    │ • Token binding │    │ • Brand tokens  │     │
│  │ • Keyboard nav  │    │ • Figma props   │    │ • Theme mode    │     │
│  │ • ARIA support  │    │ • Styling hooks │    │ • Platform      │     │
│  │ • Focus mgmt    │    │ • State mapping │    │ • Density       │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  RULES:                                                                 │
│  ✓ Import from @base-ui-components/react/*                             │
│  ✓ Customize through className, style, and render props                │
│  ✓ Use Base UI's built-in accessibility features                       │
│  ✗ NEVER fork or copy Base UI source code                              │
│  ✗ NEVER override internal Base UI behaviors                           │
│  ✗ NEVER recreate functionality Base UI provides                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### A1.2 Base UI Component Mapping

| One UI Component | Base UI Primitive | Import Path |
|-----------------|-------------------|-------------|
| Button | Button | `@base-ui-components/react/button` |
| IconButton | Button | `@base-ui-components/react/button` |
| Checkbox | Checkbox | `@base-ui-components/react/checkbox` |
| Switch | Switch | `@base-ui-components/react/switch` |
| TextField | Input | `@base-ui-components/react/input` |
| Select | Select | `@base-ui-components/react/select` |
| Menu | Menu | `@base-ui-components/react/menu` |
| Dialog | Dialog | `@base-ui-components/react/dialog` |
| Popover | Popover | `@base-ui-components/react/popover` |
| Tooltip | Tooltip | `@base-ui-components/react/tooltip` |
| Tabs | Tabs | `@base-ui-components/react/tabs` |
| Progress | Progress | `@base-ui-components/react/progress` |
| Slider | Slider | `@base-ui-components/react/slider` |
| AlertDialog | AlertDialog | `@base-ui-components/react/alert-dialog` |

### A1.3 Acceptance Criteria

- [ ] AC-A1.1: All components import from `@base-ui-components/react/*`
- [ ] AC-A1.2: No Base UI source code is copied into the codebase
- [ ] AC-A1.3: Base UI version is pinned in package.json
- [ ] AC-A1.4: Upgrade path documented for Base UI updates
- [ ] AC-A1.5: All accessibility features from Base UI are preserved

---

## A2: File Structure

### A2.1 Component Directory Structure

```
src/components/
├── Button/
│   ├── index.ts                    # Public exports
│   ├── Button.tsx                  # React Web implementation
│   ├── Button.native.tsx           # React Native implementation
│   ├── Button.shared.ts            # Shared types, hooks, utilities
│   ├── Button.module.css           # Web styles (CSS Modules)
│   ├── Button.tokens.ts            # Token mapping definitions
│   ├── Button.stories.tsx          # Storybook stories (Web)
│   ├── Button.stories.native.tsx   # Storybook stories (Native)
│   ├── Button.test.tsx             # Unit tests
│   ├── Button.a11y.test.tsx        # Accessibility tests
│   ├── Button.perf.test.tsx        # Performance tests
│   └── Button.md                   # AI/LLM documentation
│
├── [ComponentName]/
│   └── ... (same structure)
│
└── index.ts                        # Component registry
```

### A2.2 File Purposes

| File | Purpose | Required |
|------|---------|----------|
| `index.ts` | Public exports only | Yes |
| `*.tsx` | React Web component | Yes |
| `*.native.tsx` | React Native component | Yes |
| `*.shared.ts` | Types, hooks shared between platforms | Yes |
| `*.module.css` | CSS Modules styling (web only) | Yes |
| `*.tokens.ts` | Token resolution hooks | Yes |
| `*.stories.tsx` | Storybook stories (web) | Yes |
| `*.stories.native.tsx` | Storybook stories (native) | Yes |
| `*.test.tsx` | Unit tests | Yes |
| `*.a11y.test.tsx` | Accessibility tests | Yes |
| `*.perf.test.tsx` | Performance benchmarks | No |
| `*.md` | AI documentation | Yes |

### A2.3 Acceptance Criteria

- [ ] AC-A2.1: All required files present for each component
- [ ] AC-A2.2: File naming matches component name exactly
- [ ] AC-A2.3: `index.ts` exports only public API
- [ ] AC-A2.4: No circular dependencies between files

---

## A3: Code Generation Templates

### A3.1 React Web Component Template

```typescript
// Button.tsx

import { Button as BaseButton } from '@base-ui-components/react/button';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';
import type { ButtonProps } from './Button.shared';
import { useButtonTokens } from './Button.tokens';

/**
 * Button component - Primary interactive element for triggering actions.
 *
 * @example
 * <Button attention="high" appearance="primary">
 *   Submit
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      // Appearance
      attention = 'high',
      appearance = 'auto',
      contained = true,
      condensed = false,

      // Size
      size = 'M',

      // Content
      start,
      children,
      end,

      // State
      disabled = false,
      loading = false,
      fullWidth = false,

      // Standard props
      className,
      ...props
    },
    ref
  ) => {
    const tokens = useButtonTokens({ attention, appearance, contained });

    return (
      <BaseButton
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={clsx(
          styles.button,
          styles[`attention-${attention}`],
          styles[`appearance-${appearance}`],
          styles[`size-${size}`],
          contained && styles.contained,
          condensed && styles.condensed,
          fullWidth && styles.fullWidth,
          loading && styles.loading,
          className
        )}
        {...props}
      >
        {loading ? (
          <CircularProgress size={size} aria-hidden="true" />
        ) : (
          <>
            {start && <span className={styles.start}>{start}</span>}
            <span className={styles.content}>{children}</span>
            {end && <span className={styles.end}>{end}</span>}
          </>
        )}
      </BaseButton>
    );
  }
);

Button.displayName = 'Button';
```

### A3.2 CSS Module Template

```css
/* Button.module.css */

/* =============================================================================
   BASE STYLES
   All values MUST use CSS variables — zero literals allowed
   ============================================================================= */

.button {
  /* Shape — Interactive elements MUST use Pill */
  border-radius: var(--Shape-Pill);

  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--Spacing-2-5);

  /* Typography */
  font-family: var(--Font-Family);
  font-weight: var(--Typography-Weight-Medium);

  /* Reset */
  border: none;
  cursor: pointer;
  text-decoration: none;

  /* Motion — Connected to Motion foundation */
  transition:
    background-color var(--Motion-Discreet-Short) var(--Motion-Easing-Standard),
    color var(--Motion-Discreet-Short) var(--Motion-Easing-Standard),
    transform var(--Motion-Discreet-Micro) var(--Motion-Easing-Standard),
    opacity var(--Motion-Discreet-Short) var(--Motion-Easing-Standard);
}

/* =============================================================================
   ATTENTION VARIANTS
   Connected to: Color > Surfaces foundation
   ============================================================================= */

.contained.attention-high {
  background-color: var(--Surface-Bold);
  color: var(--Text-OnBold-High);
}

.contained.attention-high:hover {
  background-color: var(--Surface-Bold-Hover);
}

.contained.attention-high:active {
  background-color: var(--Surface-Bold-Pressed);
  transform: scale(0.98);
}

.contained.attention-medium {
  background-color: var(--Surface-Subtle);
  color: var(--Text-High);
}

.contained.attention-medium:hover {
  background-color: var(--Surface-Subtle-Hover);
}

.contained.attention-low {
  background-color: var(--Surface-Ghost);
  color: var(--Text-Medium);
}

.contained.attention-low:hover {
  background-color: var(--Surface-Ghost-Hover);
  color: var(--Text-High);
}

/* =============================================================================
   SIZE VARIANTS
   Connected to: Typography + Spacing foundations
   ============================================================================= */

.size-XS {
  font-size: var(--Typography-Label-S);
  min-height: var(--Spacing-4-5);
}

.size-S {
  font-size: var(--Typography-Label-S);
  min-height: var(--Spacing-4-5);
}

.size-M {
  font-size: var(--Typography-Label-M);
  min-height: var(--Spacing-5);
}

.size-L {
  font-size: var(--Typography-Label-L);
  min-height: var(--Spacing-6);
}

.size-XL {
  font-size: var(--Typography-Label-L);
  min-height: var(--Spacing-7);
}

/* =============================================================================
   PADDING (contained × condensed combinations)
   Connected to: Spacing foundation
   ============================================================================= */

.contained:not(.condensed) {
  padding: var(--Spacing-3-5) var(--Spacing-4-5);
}

.contained.condensed {
  padding: var(--Spacing-2-5) var(--Spacing-3-5);
}

/* =============================================================================
   STATES
   ============================================================================= */

.fullWidth {
  width: 100%;
}

.button:disabled,
.button[aria-disabled="true"] {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.loading {
  position: relative;
  color: transparent;
}

/* =============================================================================
   ACCESSIBILITY — Focus styles
   ============================================================================= */

.button:focus-visible {
  outline: 2px solid var(--Focus-Ring);
  outline-offset: 2px;
}
```

### A3.3 React Native Component Template

```typescript
// Button.native.tsx

import { Pressable, Text, View, StyleSheet, type ViewStyle } from 'react-native';
import { forwardRef, useCallback } from 'react';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ButtonProps } from './Button.shared';
import { useButtonTokens } from './Button.tokens';
import { tokens } from '@/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Button component - Primary interactive element for triggering actions.
 * React Native implementation with haptic feedback and animated press.
 */
export const Button = forwardRef<View, ButtonProps>(
  (
    {
      attention = 'high',
      appearance = 'auto',
      contained = true,
      condensed = false,
      size = 'M',
      start,
      children,
      end,
      disabled = false,
      loading = false,
      fullWidth = false,
      onPress,
      style,
      ...props
    },
    ref
  ) => {
    const buttonTokens = useButtonTokens({ attention, appearance, contained });
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withTiming(0.98, {
        duration: tokens.motion.discreet.micro,
      });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withTiming(1, {
        duration: tokens.motion.discreet.short,
      });
    }, [scale]);

    const handlePress = useCallback(() => {
      // Haptic feedback for press confirmation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }, [onPress]);

    const containerStyle: ViewStyle[] = [
      styles.button,
      contained && styles.contained,
      contained && (styles as Record<string, ViewStyle>)[`attention_${attention}`],
      condensed ? styles.condensed : styles.defaultPadding,
      (styles as Record<string, ViewStyle>)[`size_${size}`],
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      style as ViewStyle,
    ].filter(Boolean) as ViewStyle[];

    return (
      <AnimatedPressable
        ref={ref}
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[containerStyle, animatedStyle]}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={buttonTokens.textColor}
            accessibilityLabel="Loading"
          />
        ) : (
          <>
            {start && <View style={styles.start}>{start}</View>}
            <Text
              style={[
                styles.label,
                (styles as Record<string, ViewStyle>)[`label_${size}`],
                { color: buttonTokens.textColor },
              ]}
            >
              {children}
            </Text>
            {end && <View style={styles.end}>{end}</View>}
          </>
        )}
      </AnimatedPressable>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.shape.Pill, // Interactive = Pill (999)
    gap: tokens.spacing['2xs'],
  },

  // Contained backgrounds
  contained: {},
  attention_high: {
    backgroundColor: tokens.surface.bold,
  },
  attention_medium: {
    backgroundColor: tokens.surface.subtle,
  },
  attention_low: {
    backgroundColor: tokens.surface.ghost,
  },

  // Padding variants
  defaultPadding: {
    paddingVertical: tokens.spacing.s,
    paddingHorizontal: tokens.spacing.l,
  },
  condensed: {
    paddingVertical: tokens.spacing['2xs'],
    paddingHorizontal: tokens.spacing.s,
  },

  // Size variants (min heights)
  size_XS: { minHeight: tokens.spacing.l },
  size_S: { minHeight: tokens.spacing.l },
  size_M: { minHeight: tokens.spacing.xl },
  size_L: { minHeight: tokens.spacing['2xl'] },
  size_XL: { minHeight: tokens.spacing['3xl'] },

  // Label sizes
  label: {
    fontFamily: tokens.typography.fontFamily,
    fontWeight: tokens.typography.weight.medium,
  },
  label_XS: { fontSize: tokens.typography.label.s },
  label_S: { fontSize: tokens.typography.label.s },
  label_M: { fontSize: tokens.typography.label.m },
  label_L: { fontSize: tokens.typography.label.l },
  label_XL: { fontSize: tokens.typography.label.l },

  // States
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.3 },

  // Slots
  start: { marginRight: tokens.spacing['2xs'] },
  end: { marginLeft: tokens.spacing['2xs'] },
});
```

### A3.4 Shared Types Template

```typescript
// Button.shared.ts

import type { ReactNode } from 'react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** Visual emphasis level */
export type ButtonAttention = 'low' | 'medium' | 'high';

/** Color scheme */
export type ButtonAppearance =
  | 'auto'
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'informative'
  | 'positive'
  | 'warning'
  | 'negative'
  | 'sparkle';

/** Component size */
export type ButtonSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

/** Button component props */
export interface ButtonProps {
  /** Visual emphasis: high=Bold surface, medium=Subtle, low=Ghost */
  attention?: ButtonAttention;

  /** Color scheme (auto inherits from context) */
  appearance?: ButtonAppearance;

  /** Whether button has background surface */
  contained?: boolean;

  /** Reduced padding for compact layouts */
  condensed?: boolean;

  /** Component size affecting icon, text, and height */
  size?: ButtonSize;

  /** Leading slot content (Icon or Progress) */
  start?: ReactNode;

  /** Main content (label text or icon) */
  children: ReactNode;

  /** Trailing slot content (Icon or Progress) */
  end?: ReactNode;

  /** Disabled state */
  disabled?: boolean;

  /** Loading state (shows spinner, announces busy) */
  loading?: boolean;

  /** Expand to fill container width */
  fullWidth?: boolean;

  /** Click/Press handler */
  onPress?: () => void;

  /** Accessibility label for icon-only buttons */
  'aria-label'?: string;

  /** Additional styling (className for web, style for native) */
  className?: string;
  style?: any;
}

// =============================================================================
// SHARED HOOKS
// =============================================================================

/**
 * Returns accessibility attributes for button
 */
export function useButtonA11y(props: Pick<ButtonProps, 'disabled' | 'loading' | 'aria-label'>) {
  return {
    role: 'button' as const,
    'aria-disabled': props.disabled || props.loading,
    'aria-busy': props.loading,
    'aria-label': props['aria-label'],
  };
}

/**
 * Determines if button should show loading spinner
 */
export function useButtonLoading(loading?: boolean) {
  return {
    showSpinner: loading,
    hideContent: loading,
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default prop values */
export const BUTTON_DEFAULTS = {
  attention: 'high' as const,
  appearance: 'auto' as const,
  contained: true,
  condensed: false,
  size: 'M' as const,
  disabled: false,
  loading: false,
  fullWidth: false,
} satisfies Partial<ButtonProps>;

/** Size to typography token mapping */
export const SIZE_TO_TYPOGRAPHY: Record<ButtonSize, string> = {
  XS: 'Label-S',
  S: 'Label-S',
  M: 'Label-M',
  L: 'Label-L',
  XL: 'Label-L',
};

/** Size to min-height spacing token mapping */
export const SIZE_TO_HEIGHT: Record<ButtonSize, string> = {
  XS: 'Spacing-4-5',
  S: 'Spacing-4-5',
  M: 'Spacing-5',
  L: 'Spacing-6',
  XL: 'Spacing-7',
};
```

### A3.5 Token Mapping Template

```typescript
// Button.tokens.ts

import { useMemo } from 'react';
import { useTokenContext } from '@/tokens/context';
import type { ButtonAttention, ButtonAppearance } from './Button.shared';

interface UseButtonTokensParams {
  attention: ButtonAttention;
  appearance: ButtonAppearance;
  contained: boolean;
}

interface ButtonTokens {
  backgroundColor: string;
  backgroundColorHover: string;
  backgroundColorPressed: string;
  textColor: string;
  iconColor: string;
  // CSS variables for web
  cssVars?: Record<string, string>;
}

/**
 * Resolves button tokens based on attention, appearance, and contained state.
 * Connected to Foundation tokens via token context.
 */
export function useButtonTokens({
  attention,
  appearance,
  contained,
}: UseButtonTokensParams): ButtonTokens {
  const { resolveToken, brand, theme, density } = useTokenContext();

  return useMemo(() => {
    // Surface tokens based on attention level
    const surfaceTokens = {
      high: {
        idle: 'Surface-Bold',
        hover: 'Surface-Bold-Hover',
        pressed: 'Surface-Bold-Pressed',
      },
      medium: {
        idle: 'Surface-Subtle',
        hover: 'Surface-Subtle-Hover',
        pressed: 'Surface-Subtle-Pressed',
      },
      low: {
        idle: 'Surface-Ghost',
        hover: 'Surface-Ghost-Hover',
        pressed: 'Surface-Ghost-Pressed',
      },
    };

    // Text tokens based on attention and contained
    const textTokens = {
      high: contained ? 'Text-OnBold-High' : 'Text-Medium',
      medium: contained ? 'Text-High' : 'Text-Medium',
      low: contained ? 'Text-Medium' : 'Text-High',
    };

    const surface = surfaceTokens[attention];
    const text = textTokens[attention];

    return {
      backgroundColor: resolveToken(surface.idle),
      backgroundColorHover: resolveToken(surface.hover),
      backgroundColorPressed: resolveToken(surface.pressed),
      textColor: resolveToken(text),
      iconColor: resolveToken(text),

      // CSS variables for inline styles (web)
      cssVars: {
        '--button-bg': `var(--${surface.idle})`,
        '--button-bg-hover': `var(--${surface.hover})`,
        '--button-bg-pressed': `var(--${surface.pressed})`,
        '--button-text': `var(--${text})`,
      },
    };
  }, [attention, appearance, contained, resolveToken, brand, theme, density]);
}

/**
 * Motion tokens for button transitions
 */
export function useButtonMotion() {
  return {
    // State transitions
    backgroundTransition: {
      duration: 'Motion-Discreet-Short', // 100ms
      easing: 'Motion-Easing-Standard',
    },
    pressTransition: {
      duration: 'Motion-Discreet-Micro', // 50ms
      easing: 'Motion-Easing-Standard',
    },
    focusTransition: {
      duration: 'Motion-Discreet-Short', // 100ms
      easing: 'Motion-Easing-Enter',
    },
  };
}
```

### A3.6 Acceptance Criteria

- [ ] AC-A3.1: All generated components follow templates exactly
- [ ] AC-A3.2: Zero hard-coded values (literals) in generated code
- [ ] AC-A3.3: Comments indicate foundation connections
- [ ] AC-A3.4: TypeScript strict mode passes
- [ ] AC-A3.5: All props are documented with JSDoc

---

## A4: Storybook Stories

### A4.1 Required Story Types (10)

Every component MUST have these stories:

| # | Story | Purpose |
|---|-------|---------|
| 1 | Default | Base usage with default props |
| 2 | Variants | All visual variants (attention levels) |
| 3 | Sizes | All size options |
| 4 | States | Disabled, Loading, etc. |
| 5 | WithIcons | Icon combinations |
| 6 | Interactive | Play functions for testing |
| 7 | Responsive | Viewport testing |
| 8 | Themes | Light/Dark/Dim comparison |
| 9 | Brands | Multi-brand showcase |
| 10 | Density | Compact/Default/Open comparison |

### A4.2 Story Template

```typescript
// Button.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Button } from './Button';
import { IconHeart, IconArrowRight } from '@/icons';

const meta: Meta<typeof Button> = {
  title: 'Components/Actions/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary interactive element for triggering actions.',
      },
    },
    design: {
      type: 'figma',
      url: 'https://figma.com/file/xxx/Button?node-id=4080-17632',
    },
  },
  argTypes: {
    attention: {
      control: 'radio',
      options: ['low', 'medium', 'high'],
      description: 'Visual emphasis level',
      table: {
        defaultValue: { summary: 'high' },
        type: { summary: 'low | medium | high' },
      },
    },
    // ... other argTypes with descriptions
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 1. DEFAULT
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// 2. VARIANTS (All attention levels)
export const Variants: Story = {
  name: 'Attention Variants',
  render: () => (
    <div className="story-grid">
      <div className="story-row">
        <span>Contained</span>
        <Button attention="high">High (Bold)</Button>
        <Button attention="medium">Medium (Subtle)</Button>
        <Button attention="low">Low (Ghost)</Button>
      </div>
      <div className="story-row">
        <span>Link</span>
        <Button attention="high" contained={false}>High</Button>
        <Button attention="medium" contained={false}>Medium</Button>
        <Button attention="low" contained={false}>Low</Button>
      </div>
    </div>
  ),
};

// 3. SIZES
export const Sizes: Story = {
  render: () => (
    <div className="story-row" style={{ alignItems: 'center' }}>
      <Button size="XS">XS</Button>
      <Button size="S">Small</Button>
      <Button size="M">Medium</Button>
      <Button size="L">Large</Button>
      <Button size="XL">XL</Button>
    </div>
  ),
};

// 4. STATES
export const States: Story = {
  render: () => (
    <div className="story-grid">
      <div className="story-row">
        <Button>Default</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>
      <div className="story-row">
        <Button condensed>Condensed</Button>
        <Button fullWidth style={{ maxWidth: 300 }}>Full Width</Button>
      </div>
    </div>
  ),
};

// 5. WITH ICONS
export const WithIcons: Story = {
  render: () => (
    <div className="story-row">
      <Button start={<IconHeart />}>Start Icon</Button>
      <Button end={<IconArrowRight />}>End Icon</Button>
      <Button start={<IconHeart />} end={<IconArrowRight />}>Both</Button>
      <Button aria-label="Favorite"><IconHeart /></Button>
    </div>
  ),
};

// 6. INTERACTIVE (Play functions)
export const Interactive: Story = {
  args: { children: 'Click Me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify button exists
    await expect(button).toBeInTheDocument();

    // Test click
    await userEvent.click(button);

    // Test keyboard navigation
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Test keyboard activation
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
  },
};

// 7. RESPONSIVE
export const Responsive: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <div style={{ width: '100%', padding: 16 }}>
      <Button fullWidth>Full Width on Mobile</Button>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        <Button>Action 1</Button>
        <Button>Action 2</Button>
      </div>
    </div>
  ),
};

// 8. THEMES
export const Themes: Story = {
  render: () => (
    <div className="story-row">
      <div data-theme="light" className="theme-card">
        <span>Light</span>
        <Button>Button</Button>
      </div>
      <div data-theme="dark" className="theme-card">
        <span>Dark</span>
        <Button>Button</Button>
      </div>
      <div data-theme="dim" className="theme-card">
        <span>Dim</span>
        <Button>Button</Button>
      </div>
    </div>
  ),
};

// 9. BRANDS
export const Brands: Story = {
  render: () => (
    <div className="story-row">
      <div data-brand="jiocinema" className="brand-card">
        <span>JioCinema</span>
        <Button>Primary</Button>
      </div>
      <div data-brand="jiomart" className="brand-card">
        <span>JioMart</span>
        <Button>Primary</Button>
      </div>
      <div data-brand="jiohotstar" className="brand-card">
        <span>JioHotstar</span>
        <Button>Primary</Button>
      </div>
    </div>
  ),
};

// 10. DENSITY
export const Density: Story = {
  render: () => (
    <div className="story-row">
      <div data-density="compact" className="density-card">
        <span>Compact</span>
        <Button>Button</Button>
      </div>
      <div data-density="default" className="density-card">
        <span>Default</span>
        <Button>Button</Button>
      </div>
      <div data-density="open" className="density-card">
        <span>Open</span>
        <Button>Button</Button>
      </div>
    </div>
  ),
};
```

### A4.3 Acceptance Criteria

- [ ] AC-A4.1: All 10 required story types present
- [ ] AC-A4.2: Interactive story has play functions for testing
- [ ] AC-A4.3: Themes/Brands/Density stories use data attributes
- [ ] AC-A4.4: ArgTypes have descriptions and default values
- [ ] AC-A4.5: Figma design link in parameters

---

## A5: Testing Requirements

### A5.1 Unit Tests

```typescript
// Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders with start icon', () => {
      render(<Button start={<span data-testid="icon">★</span>}>Label</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders with end icon', () => {
      render(<Button end={<span data-testid="icon">→</span>}>Label</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Click</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('handles loading state', () => {
      render(<Button loading>Click</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('is disabled when loading', () => {
      render(<Button loading>Click</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('calls onPress when clicked', () => {
      const onPress = jest.fn();
      render(<Button onPress={onPress}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      render(<Button disabled onPress={onPress}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('variants', () => {
    it.each(['high', 'medium', 'low'] as const)(
      'renders attention=%s variant',
      (attention) => {
        render(<Button attention={attention}>Button</Button>);
        expect(screen.getByRole('button')).toHaveClass(`attention-${attention}`);
      }
    );

    it.each(['XS', 'S', 'M', 'L', 'XL'] as const)(
      'renders size=%s variant',
      (size) => {
        render(<Button size={size}>Button</Button>);
        expect(screen.getByRole('button')).toHaveClass(`size-${size}`);
      }
    );
  });
});
```

### A5.2 Accessibility Tests

```typescript
// Button.a11y.test.tsx

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations when disabled', async () => {
    const { container } = render(<Button disabled>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has correct role', () => {
    const { getByRole } = render(<Button>Click</Button>);
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('is focusable', () => {
    const { getByRole } = render(<Button>Click</Button>);
    const button = getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });

  it('activates on Enter key', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    const { getByRole } = render(<Button onPress={onPress}>Click</Button>);

    getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalled();
  });

  it('activates on Space key', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    const { getByRole } = render(<Button onPress={onPress}>Click</Button>);

    getByRole('button').focus();
    await user.keyboard(' ');
    expect(onPress).toHaveBeenCalled();
  });

  it('has minimum touch target size (44x44)', () => {
    const { getByRole } = render(<Button>X</Button>);
    const button = getByRole('button');
    const rect = button.getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(44);
    expect(rect.height).toBeGreaterThanOrEqual(44);
  });

  it('announces disabled state', () => {
    const { getByRole } = render(<Button disabled>Click</Button>);
    expect(getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('announces loading state', () => {
    const { getByRole } = render(<Button loading>Click</Button>);
    expect(getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('icon-only button has accessible name', () => {
    const { getByRole } = render(
      <Button aria-label="Close"><span>×</span></Button>
    );
    expect(getByRole('button')).toHaveAccessibleName('Close');
  });

  it('maintains focus after click', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Button>Click</Button>);
    const button = getByRole('button');

    await user.click(button);
    expect(button).toHaveFocus();
  });
});
```

### A5.3 Performance Tests

```typescript
// Button.perf.test.tsx

import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button Performance', () => {
  it('renders within 16ms', () => {
    const start = performance.now();
    render(<Button>Click</Button>);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(16);
  });

  it('re-renders efficiently', () => {
    const { rerender } = render(<Button attention="high">Click</Button>);

    const start = performance.now();
    rerender(<Button attention="medium">Click</Button>);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(8);
  });

  it('renders 100 instances within 200ms', () => {
    const start = performance.now();

    render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <Button key={i}>Button {i}</Button>
        ))}
      </div>
    );

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200);
  });
});
```

### A5.4 Acceptance Criteria

- [ ] AC-A5.1: Unit test coverage > 90%
- [ ] AC-A5.2: All axe accessibility tests pass
- [ ] AC-A5.3: Keyboard navigation tests pass
- [ ] AC-A5.4: Touch target size tests pass
- [ ] AC-A5.5: Performance benchmarks within targets

---

## A6: AI/LLM Documentation

### A6.1 Component Markdown Template

```markdown
<!-- Button.md -->

# Button

Primary interactive element for triggering actions.

## Import

\`\`\`tsx
import { Button } from '@oneui/components';
\`\`\`

## Quick Start

\`\`\`tsx
<Button>Click me</Button>

<Button attention="high" onPress={() => alert('Pressed!')}>
  Submit
</Button>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `attention` | `'low' \| 'medium' \| 'high'` | `'high'` | Visual emphasis level |
| `appearance` | `'auto' \| 'primary' \| ...` | `'auto'` | Color scheme |
| `contained` | `boolean` | `true` | Has background surface |
| `condensed` | `boolean` | `false` | Reduced padding |
| `size` | `'XS' \| 'S' \| 'M' \| 'L' \| 'XL'` | `'M'` | Component size |
| `start` | `ReactNode` | - | Leading icon |
| `children` | `ReactNode` | **required** | Button label |
| `end` | `ReactNode` | - | Trailing icon |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state |
| `fullWidth` | `boolean` | `false` | Fill container |
| `onPress` | `() => void` | - | Press handler |
| `aria-label` | `string` | - | Accessibility label |

## Usage Patterns

### Primary Action
\`\`\`tsx
<Button attention="high">Submit Order</Button>
\`\`\`

### Secondary Action
\`\`\`tsx
<Button attention="medium">Save Draft</Button>
\`\`\`

### Tertiary/Ghost Action
\`\`\`tsx
<Button attention="low">Cancel</Button>
\`\`\`

### Link Button
\`\`\`tsx
<Button contained={false}>Learn More</Button>
\`\`\`

### Destructive Action
\`\`\`tsx
<Button appearance="negative">Delete</Button>
\`\`\`

### With Icon
\`\`\`tsx
<Button start={<IconPlus />}>Add Item</Button>
<Button end={<IconArrowRight />}>Continue</Button>
\`\`\`

### Icon-Only (requires aria-label)
\`\`\`tsx
<Button aria-label="Close dialog">
  <IconClose />
</Button>
\`\`\`

### Loading State
\`\`\`tsx
<Button loading>Processing...</Button>
\`\`\`

## Accessibility

- **Role**: `button`
- **Keyboard**: Activates on `Enter` or `Space`
- **Focus**: Visible focus ring
- **Touch target**: Minimum 44×44px
- **Icon-only**: Must have `aria-label`

## DO's

- Use `attention="high"` for primary page action (only one per view)
- Provide action-oriented labels ("Submit", "Save", "Delete")
- Use icons to reinforce meaning
- Set `aria-label` on icon-only buttons

## DON'Ts

- Don't use multiple high-attention buttons in same view
- Don't use vague labels ("Click here", "Submit")
- Don't disable without explanation (use tooltip)
- Don't use color alone to convey meaning

## Connected Tokens

- **Color**: Surface-Bold, Surface-Subtle, Surface-Ghost, Text-OnBold-High
- **Typography**: Label-S, Label-M, Label-L
- **Spacing**: Spacing-2-5, Spacing-3-5, Spacing-4-5, Spacing-5
- **Shape**: Shape-Pill (999px — locked for interactive)
- **Motion**: Discreet-Micro, Discreet-Short, Easing-Standard

## Platform Parity

| Feature | Web | Native |
|---------|-----|--------|
| All variants | ✅ | ✅ |
| All sizes | ✅ | ✅ |
| Loading | ✅ | ✅ |
| Press animation | ✅ | ✅ |
| Keyboard nav | ✅ | N/A |
| Haptics | N/A | ✅ |
```

### A6.2 Acceptance Criteria

- [ ] AC-A6.1: Every component has a `.md` file
- [ ] AC-A6.2: All props documented with types and defaults
- [ ] AC-A6.3: Code examples for all common patterns
- [ ] AC-A6.4: DO's and DON'Ts section present
- [ ] AC-A6.5: Token dependencies listed
- [ ] AC-A6.6: Platform parity table accurate

---

## A7: Quality Gates

### A7.1 Pre-Commit Validation

```typescript
interface ComponentQualityGates {
  literals: boolean;        // pnpm check:literals → Zero violations
  tokens: boolean;          // pnpm validate:tokens → 100% resolved
  typescript: boolean;      // pnpm typecheck → Zero errors
  tests: number;            // pnpm test → 90% coverage
  a11y: boolean;            // pnpm test:a11y → Zero critical violations
  parity: boolean;          // pnpm check:parity → Web ↔ Native
  chromatic: boolean;       // pnpm chromatic → Visual regression
  performance: boolean;     // Bundle < 5KB, render < 16ms
  storybook: boolean;       // All 10 story types
  aiDocs: boolean;          // *.md present and valid
}
```

### A7.2 CI Pipeline

```yaml
# .github/workflows/component-validation.yml

name: Component Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: pnpm install

      - name: Check for literals
        run: pnpm check:literals

      - name: Validate tokens
        run: pnpm validate:tokens

      - name: TypeScript check
        run: pnpm typecheck

      - name: Run tests
        run: pnpm test --coverage
        env:
          COVERAGE_THRESHOLD: 90

      - name: Accessibility tests
        run: pnpm test:a11y

      - name: Platform parity check
        run: pnpm check:parity

      - name: Performance benchmarks
        run: pnpm test:perf

      - name: Validate Storybook stories
        run: pnpm validate:stories

      - name: Validate AI documentation
        run: pnpm validate:ai-docs

      - name: Chromatic visual tests
        run: pnpm chromatic
        env:
          CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_TOKEN }}
```

### A7.3 Acceptance Criteria

- [ ] AC-A7.1: All quality gates pass before merge
- [ ] AC-A7.2: CI pipeline runs on every PR
- [ ] AC-A7.3: Coverage reports published
- [ ] AC-A7.4: Chromatic catches visual regressions
- [ ] AC-A7.5: Failed gates block merge

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Bundle size per component | < 5KB gzipped |
| First render time | < 16ms |
| Re-render time | < 8ms |
| Token resolution time | < 1ms |
| Test coverage | > 90% |
| Accessibility score | 100% |
| Web/Native API parity | 100% |
| Zero literals | 0 violations |

---

## Related Documents

- [PRD-04: Components Section](./PRD-04-COMPONENTS.md) — Platform UI/UX
- [PRD-03: Foundations](./PRD-03-FOUNDATIONS.md) — Token definitions
- [CLAUDE.md](../CLAUDE.md) — Development guidelines
