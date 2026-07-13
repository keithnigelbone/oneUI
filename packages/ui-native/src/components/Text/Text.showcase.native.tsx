/**
 * Text.showcase.native.tsx
 *
 * Parity with `packages/ui/src/components/text/Text.showcase.tsx` +
 * `Text.stories.tsx` — variants, sizes, attention × weight, appearances,
 * decorations, and a `<Surface mode="bold">` section that exercises
 * surface-context-aware colour remapping.
 */

import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import { Surface, useSurfaceTokens } from '../../theme';
import { Text } from './Text.native';
import {
  BODY_VALID_ORDER,
  TEXT_APPEARANCES,
  TEXT_ATTENTIONS,
  TEXT_WEIGHTS,
  type TextAppearance,
  type TextSizeBody,
  type TextSizeCode,
  type TextSizeDisplay,
  type TextSizeLabel,
} from './interface';

const stack: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: tokens.spacing['4-5'],
};

const wrapRow: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4-5'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3-5'],
};

function CaptionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <Text variant="body" size="XS" attention="low">
      {children}
    </Text>
  );
}

/* ============================================================================
 * Default — single playable instance, mirrors web `Default` story.
 * ========================================================================= */
export function TextDefault(): React.ReactElement {
  return (
    <View style={stack}>
      <Text variant="body" size="M">
        The quick brown fox jumps over the lazy dog
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Variant matrix — every variant × every valid size × all 3 attention levels
// (low / medium / high). Each size group renders one Text per attention so
// designers can verify content colour scaling against the live brand surface.
// Largest size first, descending — mirrors the Figma spec sheet.
// ---------------------------------------------------------------------------

const DISPLAY_SIZES: readonly TextSizeDisplay[] = ['L', 'M', 'S'];
const HEADLINE_SIZES: readonly TextSizeDisplay[] = ['L', 'M', 'S'];
const TITLE_SIZES: readonly TextSizeDisplay[] = ['L', 'M', 'S'];
const BODY_SIZES: readonly TextSizeBody[] = ['L', 'M', 'S', 'XS', '2XS'];
const LABEL_SIZES: readonly TextSizeLabel[] = ['L', 'M', 'S', 'XS', '2XS', '3XS'];
const CODE_SIZES: readonly TextSizeCode[] = ['M', 'S', 'XS'];

/** Attention rows rendered per size, from least to most prominent. */
const ATTENTION_STACK = ['low', 'medium', 'high'] as const;
type AttentionLevel = (typeof ATTENTION_STACK)[number];

function HairlineDivider(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View
      style={{
        height: tokens.borderWidth.hairline,
        backgroundColor: role.content.strokeLow,
        marginVertical: tokens.spacing['2'],
      }}
    />
  );
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const attentionStackStyle: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['0-5'],
};

interface DisplaySizeBlockProps {
  variant: 'display' | 'headline' | 'title';
  size: TextSizeDisplay;
}

function DisplaySizeBlock({ variant, size }: DisplaySizeBlockProps): React.ReactElement {
  const label = `${capitalize(variant)} ${size}`;
  return (
    <View style={attentionStackStyle}>
      {ATTENTION_STACK.map((attention) =>
        variant === 'display' ? (
          <Text key={attention} variant="display" size={size} attention={attention}>
            {label}
          </Text>
        ) : variant === 'headline' ? (
          <Text key={attention} variant="headline" size={size} attention={attention}>
            {label}
          </Text>
        ) : (
          <Text key={attention} variant="title" size={size} attention={attention}>
            {label}
          </Text>
        )
      )}
    </View>
  );
}

interface BodyAttentionStackProps {
  size: TextSizeBody;
}

function BodyAttentionStack({ size }: BodyAttentionStackProps): React.ReactElement {
  const label = `Body ${size}`;
  return (
    <View style={attentionStackStyle}>
      {ATTENTION_STACK.map((attention: AttentionLevel) => (
        <Text key={attention} variant="body" size={size} attention={attention}>
          {label}
        </Text>
      ))}
    </View>
  );
}

interface LabelAttentionStackProps {
  size: TextSizeLabel;
}

function LabelAttentionStack({ size }: LabelAttentionStackProps): React.ReactElement {
  const label = `Label ${size}`;
  return (
    <View style={attentionStackStyle}>
      {ATTENTION_STACK.map((attention: AttentionLevel) => (
        <Text key={attention} variant="label" size={size} attention={attention}>
          {label}
        </Text>
      ))}
    </View>
  );
}

interface CodeAttentionStackProps {
  size: TextSizeCode;
}

function CodeAttentionStack({ size }: CodeAttentionStackProps): React.ReactElement {
  const label = `Code ${size}`;
  return (
    <View style={attentionStackStyle}>
      {ATTENTION_STACK.map((attention: AttentionLevel) => (
        <Text key={attention} variant="code" size={size} attention={attention}>
          {label}
        </Text>
      ))}
    </View>
  );
}

/**
 * Variants — every typography role × every valid size × all three attention
 * levels (low / medium / high). Each size group is a 3-row stack so designers
 * can compare content-colour scaling under the active brand. Mirrors the
 * Figma spec sheet referenced by the platform team.
 */
export function TextVariants(): React.ReactElement {
  return (
    <View style={variantMatrix}>
      {DISPLAY_SIZES.map((size, idx) => (
        <React.Fragment key={`display-${size}`}>
          <DisplaySizeBlock variant="display" size={size} />
          {idx < DISPLAY_SIZES.length - 1 ? <HairlineDivider /> : null}
        </React.Fragment>
      ))}
      <HairlineDivider />
      {HEADLINE_SIZES.map((size, idx) => (
        <React.Fragment key={`headline-${size}`}>
          <DisplaySizeBlock variant="headline" size={size} />
          {idx < HEADLINE_SIZES.length - 1 ? <HairlineDivider /> : null}
        </React.Fragment>
      ))}
      <HairlineDivider />
      {TITLE_SIZES.map((size, idx) => (
        <React.Fragment key={`title-${size}`}>
          <DisplaySizeBlock variant="title" size={size} />
          {idx < TITLE_SIZES.length - 1 ? <HairlineDivider /> : null}
        </React.Fragment>
      ))}
      <HairlineDivider />
      {LABEL_SIZES.map((size, idx) => (
        <React.Fragment key={`label-${size}`}>
          <LabelAttentionStack size={size} />
          {idx < LABEL_SIZES.length - 1 ? <HairlineDivider /> : null}
        </React.Fragment>
      ))}
      <HairlineDivider />
      {BODY_SIZES.map((size, idx) => (
        <React.Fragment key={`body-${size}`}>
          <BodyAttentionStack size={size} />
          {idx < BODY_SIZES.length - 1 ? <HairlineDivider /> : null}
        </React.Fragment>
      ))}
      <HairlineDivider />
      {CODE_SIZES.map((size, idx) => (
        <React.Fragment key={`code-${size}`}>
          <CodeAttentionStack size={size} />
          {idx < CODE_SIZES.length - 1 ? <HairlineDivider /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const variantMatrix: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3'],
};

/** Sizes — Body variant across every public size + the clamped 3XS. */
export function TextSizes(): React.ReactElement {
  return (
    <View style={stack}>
      {BODY_VALID_ORDER.map((size) => (
        <View key={size} style={row}>
          <View style={{ minWidth: tokens.spacing['9'] }}>
            <CaptionLabel>{size}</CaptionLabel>
          </View>
          <Text variant="body" size={size}>
            The quick brown fox jumps over the lazy dog
          </Text>
        </View>
      ))}
      <View style={row}>
        <View style={{ minWidth: tokens.spacing['9'] }}>
          <CaptionLabel>3XS (invalid → 2XS)</CaptionLabel>
        </View>
        {/* Intentional invalid size — runtime clamp + dev warning. */}
        <Text variant="body" size={'3XS' as unknown as TextSizeBody}>
          The quick brown fox jumps over the lazy dog
        </Text>
      </View>
    </View>
  );
}

/** Attention × Weight — body M across every attention level, three weights. */
export function TextAttentionAndWeight(): React.ReactElement {
  return (
    <View style={stack}>
      {TEXT_ATTENTIONS.map((attention) => (
        <View key={attention} style={row}>
          <View style={{ minWidth: tokens.spacing['10'] }}>
            <CaptionLabel>{attention}</CaptionLabel>
          </View>
          <View style={wrapRow}>
            {TEXT_WEIGHTS.map((weight) => (
              <Text key={weight} variant="body" attention={attention} weight={weight}>
                {weight} weight
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Appearances — all roles at high + tintedA11y attention. */
export function TextAppearances(): React.ReactElement {
  return (
    <View style={stack}>
      {(['high', 'tintedA11y'] as const).map((attention) => (
        <View key={attention} style={column}>
          <CaptionLabel>{`attention = ${attention}`}</CaptionLabel>
          <View style={wrapRow}>
            {TEXT_APPEARANCES.map((appearance: Exclude<TextAppearance, 'auto'>) => (
              <View
                key={appearance}
                style={{
                  flexDirection: 'column',
                  gap: tokens.spacing['2'],
                  alignItems: 'flex-start',
                }}
              >
                <Text variant="title" size="M" appearance={appearance} attention={attention}>
                  {appearance}
                </Text>
                <Text variant="body" size="2XS" attention="low">
                  {appearance}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Decorations — italic, underline, strikethrough, combined. */
export function TextDecorations(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={row}>
        <View style={{ minWidth: tokens.spacing['12'] }}>
          <CaptionLabel>plain</CaptionLabel>
        </View>
        <Text>The quick brown fox</Text>
      </View>
      <View style={row}>
        <View style={{ minWidth: tokens.spacing['12'] }}>
          <CaptionLabel>italic</CaptionLabel>
        </View>
        <Text italic>The quick brown fox</Text>
      </View>
      <View style={row}>
        <View style={{ minWidth: tokens.spacing['12'] }}>
          <CaptionLabel>underline</CaptionLabel>
        </View>
        <Text underline>The quick brown fox</Text>
      </View>
      <View style={row}>
        <View style={{ minWidth: tokens.spacing['12'] }}>
          <CaptionLabel>strikethrough</CaptionLabel>
        </View>
        <Text strikethrough>The quick brown fox</Text>
      </View>
      <View style={row}>
        <View style={{ minWidth: tokens.spacing['12'] }}>
          <CaptionLabel>combined</CaptionLabel>
        </View>
        <Text italic underline strikethrough>
          The quick brown fox
        </Text>
      </View>
    </View>
  );
}

/**
 * Surface Context — Text inside every surface mode automatically remaps to
 * the contextually-correct on-colour because `useSurfaceTokens` reads from
 * the nearest `<Surface>` parent. Same model as web `[data-surface]`.
 */
export function TextSurfaceContext(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const surfaceModes = [
    { mode: 'default' as const, desc: 'page background' },
    { mode: 'minimal' as const, desc: 'light tint' },
    { mode: 'subtle' as const, desc: 'medium tint' },
    { mode: 'moderate' as const, desc: 'heavier tint' },
    { mode: 'bold' as const, desc: 'full accent fill' },
    { mode: 'elevated' as const, desc: 'floating panel' },
  ];
  const surfaceStyle: ViewStyle = {
    padding: tokens.spacing['4-5'],
    borderRadius: tokens.shape.m,
    gap: tokens.spacing['3'],
  };
  return (
    <View style={[stack, { borderColor: role.content.strokeLow }]}>
      {surfaceModes.map(({ mode, desc }) => (
        <View key={mode} style={column}>
          <CaptionLabel>{`${mode} — ${desc}`}</CaptionLabel>
          <Surface mode={mode} style={surfaceStyle}>
            <Text variant="title" size="M" attention="high">
              Title — high attention
            </Text>
            <Text variant="body" size="M" attention="medium">
              Body — medium attention
            </Text>
            <Text variant="body" size="S" attention="low">
              Caption — low attention
            </Text>
            <Text variant="label" size="S" attention="tintedA11y" appearance="primary">
              Label — tintedA11y primary
            </Text>
          </Surface>
        </View>
      ))}
    </View>
  );
}

/** Truncation — single-line ellipsis and multi-line clamp via `maxLines`. */
export function TextTruncation(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>maxLines = 1 (single-line ellipsis)</CaptionLabel>
        <View style={{ maxWidth: tokens.spacing['40'] }}>
          <Text variant="body" maxLines={1}>
            This text overflows the container and should truncate with an ellipsis after a single
            line of content.
          </Text>
        </View>
      </View>

      <View style={column}>
        <CaptionLabel>maxLines = 3 (multi-line clamp)</CaptionLabel>
        <View>
          <Text variant="body" maxLines={3}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Alignment — left, center, right paragraphs. */
export function TextAlignment(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>textAlign = left</CaptionLabel>
        <Text variant="body" textAlign="left">
          Left-aligned paragraph.
        </Text>
      </View>
      <View style={column}>
        <CaptionLabel>textAlign = center</CaptionLabel>
        <Text variant="body" textAlign="center">
          Centred paragraph.
        </Text>
      </View>
      <View style={column}>
        <CaptionLabel>textAlign = right</CaptionLabel>
        <Text variant="body" textAlign="right">
          Right-aligned paragraph.
        </Text>
      </View>
    </View>
  );
}

/**
 * Link slot — two API shapes:
 *   - `link={substring}` → split the rendered string at the substring and
 *     style that segment as an inline, tappable link.
 *   - `link={<ReactNode>}` → trailing slot (Layers `_linkText-slot`).
 */
export function TextLink(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>inline link via `link="documentation"`</CaptionLabel>
        <Text variant="body" link="documentation" onLinkPress={() => undefined}>
          Read more in the documentation before continuing.
        </Text>
      </View>

      <View style={column}>
        <CaptionLabel>link substring at the end of the copy</CaptionLabel>
        <Text variant="body" link="Privacy Policy" onLinkPress={() => undefined}>
          By signing up you agree to our Privacy Policy.
        </Text>
      </View>

      <View style={column}>
        <CaptionLabel>link substring at the start of the copy</CaptionLabel>
        <Text variant="body" link="Terms of Service" onLinkPress={() => undefined}>
          Terms of Service apply when using this product.
        </Text>
      </View>

      <View style={column}>
        <CaptionLabel>trailing slot (ReactNode) — for richer link content</CaptionLabel>
        <Text
          variant="body"
          link={
            <Text appearance="primary" attention="tintedA11y" underline onPress={() => undefined}>
              {' learn more →'}
            </Text>
          }
        >
          Custom node appended to the end of the copy:
        </Text>
      </View>
    </View>
  );
}

/* ============================================================================
 * TruncationAlignmentAndLink — web's combined story with all three sub-cases
 * in one section. Native keeps the granular exports above for fine-grained
 * sample-app sections, plus this aggregator for direct parity.
 * ========================================================================= */
export function TextTruncationAlignmentAndLink(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>Explicit heading (web `as=&quot;h1&quot;`)</CaptionLabel>
        <Text variant="display" size="L">
          Semantic page title
        </Text>
      </View>
      <TextTruncation />
      <TextAlignment />
      <TextLink />
    </View>
  );
}

/** Disabled visual treatment via `appearance` + low attention (mirrors web). */
export function TextDisabled(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={row}>
        <View style={{ minWidth: tokens.spacing['12'] }}>
          <CaptionLabel>enabled</CaptionLabel>
        </View>
        <Text variant="body" attention="high">
          Enabled state
        </Text>
      </View>
      <View style={row}>
        <View style={{ minWidth: tokens.spacing['12'] }}>
          <CaptionLabel>disabled</CaptionLabel>
        </View>
        <Text variant="body" attention="low">
          Disabled (attention=low)
        </Text>
      </View>
    </View>
  );
}
