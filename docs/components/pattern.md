# Component Development Pattern

## File Structure

Every component must follow this exact structure:

```
components/ComponentName/
├── ComponentName.shared.ts     # ✅ Types & hooks
├── ComponentName.tsx           # ✅ Web (React)
├── ComponentName.native.tsx    # ✅ Native (RN)
├── ComponentName.module.css    # ✅ Styles
├── ComponentName.stories.tsx   # ✅ Stories
├── ComponentName.test.tsx      # ✅ Tests
└── index.ts                   # ✅ Exports
```

## 1. Shared Types (.shared.ts)

Define props and hooks used by both web and native:

```typescript
// Button.shared.ts
export interface ButtonProps {
  children: ReactNode;
  variant?: 'bold' | 'subtle' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

export function useButtonState(props: ButtonProps) {
  const isDisabled = props.disabled || props.loading;

  return {
    isDisabled,
    ariaProps: {
      'aria-disabled': isDisabled,
      'aria-busy': props.loading,
    },
  };
}
```

## 2. Web Implementation (.tsx)

Use @base-ui/react primitives:

```typescript
// Button.tsx
import { Button as BaseButton } from '@base-ui/react';
import styles from './Button.module.css';
import { ButtonProps, useButtonState } from './Button.shared';

export const Button: React.FC<ButtonProps> = (props) => {
  const { isDisabled, ariaProps } = useButtonState(props);

  return (
    <BaseButton
      className={styles.button}
      disabled={isDisabled}
      onClick={props.onPress}
      {...ariaProps}
    >
      {props.children}
    </BaseButton>
  );
};
```

**Rules:**
- ✅ Use `@base-ui/react` primitives
- ✅ Import styles from `.module.css`
- ✅ Use shared types from `.shared.ts`
- ❌ Never fork Base UI behavior
- ❌ Never add inline styles

## 3. Styles (CSS Module)

Token-only styling:

```css
/* Button.module.css */

.button {
  /* Shape - Interactive = Pill */
  border-radius: var(--Shape-Pill);

  /* Surface - All from tokens */
  background-color: var(--Surface-Bold);
  color: var(--Text-OnBold-High);

  /* Spacing - All from tokens */
  padding: var(--Spacing-4) var(--Spacing-4-5);

  /* Motion - All from tokens */
  transition-duration: var(--Motion-Duration-Discreet-M);
}

.bold {
  background-color: var(--Surface-Bold);
}

.subtle {
  background-color: var(--Surface-Subtle);
}

.ghost {
  background-color: transparent;
  border: 1px solid var(--Surface-Bold);
}
```

**Rules:**
- ✅ Use only `var(--Token-Name)` references
- ✅ Use CSS custom properties for everything
- ❌ NO hex colors (#fff)
- ❌ NO RGB colors (rgb(0,0,0))
- ❌ NO hard-coded pixels (except 0, 999px, 100%)
- ❌ NO OkLCH in CSS (use var() instead)

Verified by: `pnpm check:literals`

## 4. React Native Implementation (.native.tsx)

Use React Native with StyleSheet:

```typescript
// Button.native.tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import { ButtonProps, useButtonState } from './Button.shared';

export const Button: React.FC<ButtonProps> = (props) => {
  const { isDisabled, ariaProps } = useButtonState(props);

  return (
    <Pressable
      style={styles.button}
      disabled={isDisabled}
      onPress={props.onPress}
      accessibilityRole="button"
      {...ariaProps}
    >
      <Text style={styles.label}>{props.children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: tokens.shape.Pill,  // Interactive = Pill
    backgroundColor: tokens.surface.bold,
    paddingVertical: tokens.spacing.m,
    paddingHorizontal: tokens.spacing.l,
    minHeight: 44, // Touch target
  },
  label: {
    color: tokens.text.onBoldHigh,
  },
});
```

**Rules:**
- ✅ Use `tokens.*` object for all values
- ✅ Match web component API exactly
- ✅ Min 44×44px touch targets
- ✅ Use `onPress` (not `onClick`)
- ❌ NO hard-coded colors
- ❌ NO hard-coded pixels

## 5. Storybook Stories (.stories.tsx)

All 8 required story types:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;

// 1. Default
export const Default: StoryObj = {
  args: { children: 'Button' },
};

// 2. Variants
export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button variant="bold">Bold</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

// 3. Sizes
export const Sizes: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  ),
};

// 4. States
export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
    </div>
  ),
};

// 5. WithIcons
export const WithIcons: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button>← Back</Button>
      <Button>Next →</Button>
    </div>
  ),
};

// 6. Interactive
export const Interactive: StoryObj = {
  args: { children: 'Click me' },
  play: async ({ canvasElement }) => {
    // Play function for interaction testing
  },
};

// 7. Responsive
export const Responsive: StoryObj = {
  render: () => (
    <div>
      <h3>Desktop</h3>
      <Button>Desktop</Button>
      <h3>Mobile (375px)</h3>
      <div style={{ width: '375px' }}>
        <Button>Mobile</Button>
      </div>
    </div>
  ),
};

// 8. Themes
export const Themes: StoryObj = {
  render: () => (
    <div>
      <div style={{ padding: '20px', backgroundColor: '#fff' }}>
        <h3>Light</h3>
        <Button>Light</Button>
      </div>
      <div style={{ padding: '20px', backgroundColor: '#1a1a1a' }}>
        <h3 style={{ color: '#fff' }}>Dark</h3>
        <Button>Dark</Button>
      </div>
    </div>
  ),
};
```

## 6. Tests (.test.tsx)

Unit and accessibility tests:

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Test');
  });

  it('calls onPress when clicked', async () => {
    const user = userEvent.setup();
    const handlePress = vi.fn();
    render(<Button onPress={handlePress}>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(handlePress).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled=true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## 7. Index Export

```typescript
// index.ts
export { Button, type ButtonProps } from './Button';
export { useButtonState } from './Button.shared';
```

## Component Checklist

Before shipping:

- ✅ File structure complete (all 7 files)
- ✅ `Button.shared.ts` - Props + hooks defined
- ✅ `Button.tsx` - Uses Base UI, no forking
- ✅ `Button.native.tsx` - Parity with web API
- ✅ `Button.module.css` - Token-only (zero literals)
- ✅ `Button.stories.tsx` - All 8 story types
- ✅ `Button.test.tsx` - Unit + a11y tests
- ✅ `index.ts` - Exports ready
- ✅ `pnpm check:literals` passes
- ✅ `pnpm check:parity` passes
- ✅ `pnpm typecheck` passes
- ✅ Stories appear in Storybook

## Scaffolding Tool

Generate all files automatically:

```bash
npx tsx scripts/generate-component.ts ComponentName
```

Then implement the component following this pattern.

## Example: Button

Reference implementation in:
- `packages/ui/src/components/Button/` - Web
- `packages/ui-native/src/components/Button/` - Native

Copy this structure for all new components.
