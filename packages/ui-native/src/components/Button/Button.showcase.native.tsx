/**
 * Button.showcase.native.tsx
 *
 * Native peer of `packages/ui/src/components/Button/Button.showcase.tsx`.
 * One showcase function per Storybook "story" — every export matches the
 * web file's name and intent, so the component-gallery screen in
 * `apps/native-sample` mirrors what reviewers see in Storybook.
 *
 * Where parity isn't 1:1, the divergence is documented inline:
 *   - `ButtonThemes`  — web renders two `data-mode` blocks side-by-side.
 *                       Native theme is a global context, so we render the
 *                       active provider theme only.
 *   - `ButtonDensity` — web renders three `[data-6-Density]` cards. Native
 *                       density is global and applied at theme build time,
 *                       so we render the active density only.
 *   - Slot icons — web `<Icon name="heart" />`; native `<Icon icon={IcFavoriteGlyph} />`
 *                  (JDS IcFavorite paths inlined in `buttonShowcaseJdsGlyphs.tsx`).
 *   - Focus state — RN touch surfaces have no focus indicator, so the
 *                   web's `FocusState` story has no native equivalent.
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import type { ButtonAttention } from './interface';
import { Icon } from '../Icon/Icon.native';
import { Button } from './Button.native';
import { Radio } from '../Radio/Radio.native';
import { RadioField } from '../RadioField/RadioField.native';
import { Checkbox } from '../Checkbox/Checkbox.native';
import { IcFavoriteGlyph } from './buttonShowcaseJdsGlyphs';
import { Surface, useSurfaceTokens } from '../../theme';

// ─── Layout helpers ───────────────────────────────────────────────────────────

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const labeledItem: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3-5'],
  alignItems: 'center',
};

function CaptionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        color: role.content.low,
      }}
    >
      {children}
    </Text>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text
      style={{
        fontSize: typography.size.s,
        color: role.content.medium,
        fontWeight: typography.weight.medium,
        textTransform: 'capitalize',
      }}
    >
      {children}
    </Text>
  );
}

/**
 * Button slot icon — design-system `<Icon>` with `appearance='neutral'`.
 * Color resolves automatically from the surrounding Button surface
 * context (Button wraps its inner area in `<Surface mode={variant}>`),
 * so the same `appearance='neutral'` Icon paints `--Neutral-Bold-TintedA11y`
 * inside a bold button and `--Neutral-TintedA11y` inside a ghost button.
 */
function ButtonHeart(): React.ReactElement {
  return <Icon icon={IcFavoriteGlyph} aria-hidden />;
}

/** Standalone heart for gallery imports (not inside a Button slot). */
export function HeartIcon(): React.ReactElement {
  return <Icon icon={IcFavoriteGlyph} appearance="primary" size="5" aria-hidden />;
}

// ─── Showcases ────────────────────────────────────────────────────────────────

/**
 * Default — single Button instance, mirrors web `Default` story.
 */
export function ButtonDefault(): React.ReactElement {
  return (
    <View style={row}>
      <Button attention="high" size="m">
        Button
      </Button>
    </View>
  );
}

/**
 * High / Medium / Low attention levels.
 * Mirrors web `Button.showcase.tsx#ButtonAttentionLevels`.
 */
export function ButtonAttentionLevels(): React.ReactElement {
  return (
    <View style={row}>
      <Button attention="high">High</Button>
      <Button attention="medium">Medium</Button>
      <Button attention="low">Low</Button>
    </View>
  );
}

/**
 * Attention levels under the active theme. Web renders Light + Dark blocks
 * side-by-side; on native the theme is a global context driven by the
 * provider, so this view shows whichever theme is currently active in the
 * verifier's top-bar selector.
 */
export function ButtonThemes(): React.ReactElement {
  return (
    <View style={column}>
      <CaptionLabel>Active provider theme (toggle via top-bar)</CaptionLabel>
      <View style={row}>
        <Button attention="high">High</Button>
        <Button attention="medium">Medium</Button>
        <Button attention="low">Low</Button>
      </View>
    </View>
  );
}

/**
 * Four sizes with usage hints — matches web `ButtonSizes` layout.
 */
export function ButtonSizes(): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: tokens.spacing['4'],
      }}
    >
      <View style={labeledItem}>
        <Button size="xs">Extra Small</Button>
        <CaptionLabel>Dense inline</CaptionLabel>
      </View>
      <View style={labeledItem}>
        <Button size="s">Small</Button>
        <CaptionLabel>Compact UI</CaptionLabel>
      </View>
      <View style={labeledItem}>
        <Button size="m">Medium</Button>
        <CaptionLabel>Default</CaptionLabel>
      </View>
      <View style={labeledItem}>
        <Button size="l">Large</Button>
        <CaptionLabel>Touch targets</CaptionLabel>
      </View>
    </View>
  );
}

/**
 * Default vs condensed mode at every size. Same typography across rows,
 * reduced height + padding in the condensed row.
 */
export function ButtonCondensed(): React.ReactElement {
  const rowProps = [
    { label: 'Default', condensed: false },
    { label: 'Condensed', condensed: true },
  ] as const;

  return (
    <View style={column}>
      {rowProps.map(({ label, condensed }) => (
        <View key={label} style={{ gap: tokens.spacing['3-5'] }}>
          <SectionLabel>{label}</SectionLabel>
          <View style={row}>
            <Button size="xs" condensed={condensed}>
              Extra Small
            </Button>
            <Button size="s" condensed={condensed}>
              Small
            </Button>
            <Button size="m" condensed={condensed}>
              Medium
            </Button>
            <Button size="l" condensed={condensed}>
              Large
            </Button>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Default / disabled / loading states, each tagged with a usage label.
 */
export function ButtonStates(): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: tokens.spacing['4'],
      }}
    >
      <View style={labeledItem}>
        <Button>Default</Button>
        <CaptionLabel>Normal</CaptionLabel>
      </View>
      <View style={labeledItem}>
        <Button disabled>Disabled</Button>
        <CaptionLabel>Not available</CaptionLabel>
      </View>
      <View style={labeledItem}>
        <Button loading>Loading</Button>
        <CaptionLabel>In progress</CaptionLabel>
      </View>
    </View>
  );
}

/**
 * Start and end icon-slot combinations — Back / Next / Create, matching
 * web's `ButtonWithSlots`. Heart icon is the same stand-in the web showcase
 * uses for the slot exercise.
 */
export function ButtonWithSlots(): React.ReactElement {
  return (
    <View style={row}>
      <Button start={<ButtonHeart />}>Back</Button>
      <Button end={<ButtonHeart />}>Next</Button>
      <Button start={<ButtonHeart />} end={<ButtonHeart />}>
        Create
      </Button>
    </View>
  );
}

/**
 * Full-width row at every attention level.
 */
export function ButtonFullWidth(): React.ReactElement {
  return (
    <View style={column}>
      <Button attention="high" fullWidth>
        High Full Width
      </Button>
      <Button attention="medium" fullWidth>
        Medium Full Width
      </Button>
      <Button attention="low" fullWidth>
        Low Full Width
      </Button>
    </View>
  );
}

/**
 * Responsive — full-width primary action + a Cancel/Confirm row, mirrors
 * web `Responsive` story (mobile viewport).
 */
export function ButtonResponsive(): React.ReactElement {
  return (
    <View style={column}>
      <Button size="l" fullWidth>
        Full-Width Action
      </Button>
      <View style={row}>
        <Button size="s" attention="low">
          Cancel
        </Button>
        <Button size="s" attention="high">
          Confirm
        </Button>
      </View>
    </View>
  );
}

const ATTENTION_LEVELS: { attention: ButtonAttention; label: string }[] = [
  { attention: 'high', label: 'High' },
  { attention: 'medium', label: 'Medium' },
  { attention: 'low', label: 'Low' },
];

/**
 * All 11 multi-accent appearance roles × 3 attention levels — same matrix
 * as web's `ButtonAppearances`. Iterates over `COMPONENT_APPEARANCE_ROLES`
 * so the list stays in lockstep with the shared canonical role tuple.
 */
export function ButtonAppearances(): React.ReactElement {
  return (
    <View style={column}>
      {COMPONENT_APPEARANCE_ROLES.map((appearance) => (
        <View key={appearance} style={{ gap: tokens.spacing['3-5'] }}>
          <SectionLabel>{appearance}</SectionLabel>
          <View style={row}>
            {ATTENTION_LEVELS.map(({ attention, label }) => (
              <Button
                key={`${appearance}-${attention}`}
                appearance={appearance}
                attention={attention}
              >
                {label}
              </Button>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * `contained` toggles the fill. `contained=true` is the default solid Button;
 * `contained=false` falls through to `<LinkButton>` — text-only with optional
 * underline. Mirrors web `Button.stories.tsx#Contained`.
 */
export function ButtonContained(): React.ReactElement {
  const rows = [
    { label: 'contained=true', contained: true },
    { label: 'contained=false', contained: false },
  ] as const;
  return (
    <View style={column}>
      {rows.map(({ label, contained }) => (
        <View key={label} style={{ gap: tokens.spacing['3-5'] }}>
          <SectionLabel>{label}</SectionLabel>
          <View style={row}>
            <Button size="xs" contained={contained}>
              Extra Small
            </Button>
            <Button size="s" contained={contained}>
              Small
            </Button>
            <Button size="m" contained={contained}>
              Medium
            </Button>
            <Button size="l" contained={contained}>
              Large
            </Button>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Slot-aware padding — without slots Button uses its full per-size padding;
 * adding a `start` or `end` slot reduces the horizontal padding on the slot's
 * side and applies a per-size gap. Mirrors `Button.stories.tsx#SlotPadding`.
 */
export function ButtonSlotPadding(): React.ReactElement {
  const sizes = ['xs', 's', 'm', 'l'] as const;
  const rows = [
    { label: 'Without slots (wider padding)', start: false, end: false },
    { label: 'With start slot (reduced padding + slot gap)', start: true, end: false },
    { label: 'With both slots', start: true, end: true },
  ] as const;

  return (
    <View style={column}>
      {rows.map(({ label, start, end }) => (
        <View key={label} style={{ gap: tokens.spacing['3-5'] }}>
          <CaptionLabel>{label}</CaptionLabel>
          <View style={row}>
            {sizes.map((size) => (
              <Button
                key={size}
                size={size}
                start={start ? <ButtonHeart /> : undefined}
                end={end ? <ButtonHeart /> : undefined}
              >
                {size === 'xs'
                  ? 'Extra Small'
                  : size === 's'
                    ? 'Small'
                    : size === 'm'
                      ? 'Medium'
                      : 'Large'}
              </Button>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Loading state across attentions, slots, and sizes. The loading spinner
 * replaces the `start` slot when present; explicit `end` slots stay visible.
 * Matches `Button.stories.tsx#LoadingWithSlots`.
 */
export function ButtonLoadingWithSlots(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const onBold = role.onBoldContent.high;
  const tinted = role.content.tintedA11y;
  return (
    <View style={column}>
      <View style={row}>
        <Button loading attention="high">
          Loading
        </Button>
        <Button loading attention="medium">
          Loading
        </Button>
        <Button loading attention="low">
          Loading
        </Button>
      </View>
      <View style={row}>
        <Button loading start={<ButtonHeart />}>
          With Start
        </Button>
        <Button loading end={<ButtonHeart />}>
          With End
        </Button>
        <Button loading start={<ButtonHeart />} end={<ButtonHeart />}>
          Both
        </Button>
      </View>
      <View style={row}>
        <Button loading size="s">
          Small
        </Button>
        <Button loading size="m">
          Medium
        </Button>
        <Button loading size="l">
          Large
        </Button>
      </View>
      <CaptionLabel>
        High / Medium / Low spinner colour adapts to variant text: {onBold} → {tinted}.
      </CaptionLabel>
    </View>
  );
}

/**
 * Density showcase. Web mounts three [data-Breakpoint][data-6-Density] cards
 * side-by-side so each Button resolves against an isolated density. On native
 * density is a global theme attribute (toggled via the top-bar selector); each
 * theme build re-resolves every size token. We render at the active density
 * with a caption telling reviewers how to compare.
 */
export function ButtonDensity(): React.ReactElement {
  return (
    <View style={column}>
      <CaptionLabel>
        Active density (toggle via top-bar). Compact shrinks spacing one f-step, open expands by
        one. Re-runs `buildNativeTheme` on change — every per-size minH / padding picks up the new
        dimension scale.
      </CaptionLabel>
      <View style={row}>
        <Button size="s">Small</Button>
        <Button size="m">Medium</Button>
        <Button size="l">Large</Button>
      </View>
    </View>
  );
}

/**
 * Motion / tap-scale demo. RN drives the press animation through
 * `Animated.spring` against `Animated.Value(1)`. Per-size scale targets match
 * web's `--Motion-Tap-Scale-*` defaults: XS = 0.93, S/M/L = 0.97,
 * fullWidth = 1. `useReduceMotion()` short-circuits the spring on Android /
 * iOS Settings → Accessibility → Reduce Motion, mirroring web's
 * `@media (prefers-reduced-motion: reduce)` opt-out.
 */
export function ButtonMotion(): React.ReactElement {
  return (
    <View style={column}>
      <CaptionLabel>
        Tap each to see the spring scale-down. Compare the XS shrink against S/M/L — XS targets
        0.93, the rest 0.97.
      </CaptionLabel>
      <View style={row}>
        <Button size="xs" attention="high">
          Tap XS
        </Button>
        <Button size="s" attention="high">
          Tap S
        </Button>
        <Button size="m" attention="high">
          Tap M
        </Button>
        <Button size="l" attention="high">
          Tap L
        </Button>
      </View>
      <View style={column}>
        <CaptionLabel>Full-width — no scale (tap target is the full row)</CaptionLabel>
        <Button fullWidth attention="high">
          Tap full-width
        </Button>
      </View>
    </View>
  );
}

/**
 * Buttons rendered across surface contexts — exercises the brand cascade
 * exactly like web's `ButtonSurfaceContext`. We cover the same three modes
 * web shows (default / subtle / bold) plus the bold + slots combo so the
 * inverted-on-bold paint can be eyeballed alongside slot rendering.
 */
export function ButtonSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, desc: 'page background' },
    { mode: 'subtle' as const, desc: 'medium tint' },
    { mode: 'bold' as const, desc: 'full accent colour' },
  ];

  const cellStyle: ViewStyle = {
    padding: tokens.spacing['5'],
    borderRadius: tokens.shape.m,
    gap: tokens.spacing['3-5'],
  };

  return (
    <View style={column}>
      {surfaceModes.map(({ mode, desc }) => (
        <View key={mode} style={{ gap: tokens.spacing['3-5'] }}>
          <SectionLabel>
            {mode} — {desc}
          </SectionLabel>
          <Surface mode={mode} appearance="primary" style={cellStyle}>
            <View style={row}>
              <SlotButton attention="high" label="High" slot="start" />
              <SlotButton attention="medium" label="Medium" slot="start" />
              <SlotButton attention="low" label="Low" slot="end" />
            </View>
          </Surface>
        </View>
      ))}

      <View style={{ gap: tokens.spacing['3-5'] }}>
        <SectionLabel>bold + leading / trailing icons</SectionLabel>
        <Surface mode="bold" appearance="primary" style={cellStyle}>
          <View style={row}>
            {ATTENTION_LEVELS.map(({ attention, label }) => (
              <SlotButton key={attention} attention={attention} label={label} slot="both" />
            ))}
          </View>
        </Surface>
      </View>
    </View>
  );
}

/** Button with slot icons — icon colour follows `Button` label paint per attention. */
interface SlotButtonProps {
  attention: ButtonAttention;
  label: string;
  slot: 'start' | 'end' | 'both';
}

function SlotButton({ attention, label, slot }: SlotButtonProps): React.ReactElement {
  return (
    <Button
      attention={attention}
      start={slot === 'start' || slot === 'both' ? <ButtonHeart /> : undefined}
      end={slot === 'end' || slot === 'both' ? <ButtonHeart /> : undefined}
    >
      {label}
    </Button>
  );
}

export function ButtonPlayground(): React.ReactElement {
  const [fullWidth, setFullWidth] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [contained, setContained] = useState(true);
  const [size, setSize] = useState<any>('l');

  const layoutProps = { fullWidth, condensed, size, contained };

  return (
    <View style={column}>
      <View style={row}>
        <Checkbox label="Full Width" selected={fullWidth} onSelectedChange={setFullWidth} />
        <Checkbox label="Condensed" selected={condensed} onSelectedChange={setCondensed} />
        <Checkbox label="Contained" selected={contained} onSelectedChange={setContained} />
      </View>
      <RadioField
        label="Size"
        value={size}
        onValueChange={(v) => setSize(v as any)}
        orientation="horizontal"
      >
        <Radio value="xs" label="XS" />
        <Radio value="s" label="S" />
        <Radio value="m" label="M" />
        <Radio value="l" label="L" />
      </RadioField>

      <Button attention="high" {...layoutProps}>
        Button
      </Button>
      <Button start={<Icon icon={IcFavoriteGlyph} />} attention="high" {...layoutProps}>
        Button
      </Button>
      <Button end={<Icon icon={IcFavoriteGlyph} />} attention="high" {...layoutProps}>
        Button
      </Button>
      <Button
        start={<Icon icon={IcFavoriteGlyph} />}
        end={<Icon icon={IcFavoriteGlyph} />}
        attention="high"
        {...layoutProps}
      >
        Button
      </Button>
      <Button attention="medium" {...layoutProps}>
        Button
      </Button>
      <Button start={<Icon icon={IcFavoriteGlyph} />} attention="medium" {...layoutProps}>
        Button
      </Button>
      <Button end={<Icon icon={IcFavoriteGlyph} />} attention="medium" {...layoutProps}>
        Button
      </Button>
      <Button
        start={<Icon icon={IcFavoriteGlyph} />}
        end={<Icon icon={IcFavoriteGlyph} />}
        attention="medium"
        {...layoutProps}
      >
        Button
      </Button>
      <Button attention="low" {...layoutProps}>
        Button
      </Button>
      <Button start={<Icon icon={IcFavoriteGlyph} />} attention="low" {...layoutProps}>
        Button
      </Button>
      <Button end={<Icon icon={IcFavoriteGlyph} />} attention="low" {...layoutProps}>
        Button
      </Button>
      <Button
        start={<Icon icon={IcFavoriteGlyph} />}
        end={<Icon icon={IcFavoriteGlyph} />}
        attention="low"
        {...layoutProps}
      >
        Button
      </Button>
    </View>
  );
}

/**
 * MetallicMaterial — bold buttons that render a metallic gradient fill when
 * the active brand has a material assignment or per-component tokenRef for
 * the primary role. Non-metallic brands show the standard solid bold fill.
 *
 * Use the Tira brand in the sample app to see the gold gradient.
 */
export function ButtonMetallicMaterial(): React.ReactElement {
  return (
    <View style={column as ViewStyle}>
      <CaptionLabel>Bold (primary) — gold gradient on Tira, solid on other brands</CaptionLabel>
      <View style={row as ViewStyle}>
        <Button appearance="primary" variant="bold">Button</Button>
        <Button appearance="primary" variant="bold" start={<Icon icon={IcFavoriteGlyph} />}>Button</Button>
        <Button appearance="primary" variant="bold" end={<Icon icon={IcFavoriteGlyph} />}>Button</Button>
      </View>
      <CaptionLabel>Bold (secondary) — follows secondary role assignment</CaptionLabel>
      <View style={row as ViewStyle}>
        <Button appearance="secondary" variant="bold">Button</Button>
        <Button appearance="secondary" variant="bold" start={<Icon icon={IcFavoriteGlyph} />}>Button</Button>
      </View>
      <CaptionLabel>Subtle + Ghost — never metallic</CaptionLabel>
      <View style={row as ViewStyle}>
        <Button appearance="primary" variant="subtle">Button</Button>
        <Button appearance="primary" variant="ghost">Button</Button>
      </View>
    </View>
  );
}
