/**
 * Text.native.tsx
 *
 * RN peer of `packages/ui/src/components/text/Text.tsx`. Static decoration
 * geometry lives in `./Text.styles.native.ts`; the brand-resolved
 * font-family, font-size, line-height, weight, and content colour merge
 * inline via `useSurfaceTokens` + `useTypographyTokens`.
 *
 * Web `--_text-high/medium/low/tintedA11y` intermediate vars become a
 * single attention → role-content-token lookup. Surface context awareness
 * comes for free because `useSurfaceTokens` already resolves against the
 * nearest `<Surface>` parent — the same model Button, Badge, etc. use.
 *
 * Web `as="h1"` / `as="a"` polymorphism is intentionally not mapped: RN
 * has no element-tag concept. `Text` is a generic primitive, so it assigns no
 * role of its own — the only `accessibilityRole` it sets is `link`, when
 * `onPress` makes it interactive (see `getTextAccessibilityProps`). Heading
 * semantics are left to the caller.
 */

import React, { useMemo, type ReactNode } from 'react';
import { Text as RNText, type TextStyle } from 'react-native';
import { useSurfaceTokens, useTypographyTokens } from '../../theme';
import {
  getTextAccessibilityProps,
  useTextState,
  type TextAppearance,
  type TextAttention,
  type TextProps,
  type TextWeight,
} from './interface';
import { staticFontTextWeight } from '../../theme/typographyToTextStyle';
import {
  ALIGN_STYLE,
  VARIANT_TO_ROLE,
  sizeForRole,
  styles,
  type TextTypographyRole,
} from './Text.styles.native';
import type { ContentToken } from '@oneui/shared/engine';

// ---------------------------------------------------------------------------
// Paint resolution — attention → role content token.
// Mirrors web's `--_text-high/medium/low/tintedA11y` intermediate cascade.
// ---------------------------------------------------------------------------

const ATTENTION_TO_CONTENT: Record<
  TextAttention,
  Extract<ContentToken, 'high' | 'medium' | 'low' | 'tintedA11y'>
> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
  tintedA11y: 'tintedA11y',
};

/** Emphasis-driven roles — `useTypographyTokens` only honours `emphasis` here. */
const EMPHASIS_ROLES = new Set<TextTypographyRole>(['body', 'label', 'code']);

export function Text(props: TextProps): React.ReactElement {
  const state = useTextState(props);
  const {
    resolvedVariant,
    resolvedSize,
    resolvedWeight,
    resolvedAttention,
    resolvedAppearance,
    resolvedLang,
    resolvedScript,
    resolvedScriptMode,
  } = state;

  const role = useSurfaceTokens(resolvedAppearance);
  const typographyRole = VARIANT_TO_ROLE[resolvedVariant];
  const typography = useTypographyTokens(
    typographyRole,
    sizeForRole(typographyRole, resolvedSize),
    {
      emphasis: EMPHASIS_ROLES.has(typographyRole)
        ? typographyRole === 'code'
          ? 'medium'
          : resolvedWeight
        : undefined,
      ...(resolvedScript ? { script: resolvedScript } : null),
      scriptMode: resolvedScriptMode,
    },
  );

  const decoration = pickDecoration(props.underline, props.strikethrough);

  const usesBundledCodeItalicFont =
    typographyRole === 'code' &&
    props.italic === true &&
    typography.fontFamily === 'JetBrainsMono';

  const baseStyle = useMemo<TextStyle>(() => {
    const next: TextStyle = {
      fontFamily: usesBundledCodeItalicFont ? 'JetBrainsMono-Italic' : typography.fontFamily,
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      color: role.content[ATTENTION_TO_CONTENT[resolvedAttention]],
    };
    const staticWeight = staticFontTextWeight(typography);
    if (staticWeight != null) {
      next.fontWeight = staticWeight;
    } else {
      next.fontWeight = String(typography.fontWeight) as TextStyle['fontWeight'];
    }
    if (typography.letterSpacing != null) {
      next.letterSpacing = typography.letterSpacing;
    }
    return next;
  }, [typography, role, resolvedAttention, usesBundledCodeItalicFont]);

  const content: ReactNode =
    props.children != null ? props.children : props.text != null ? props.text : null;

  // Inline-link rendering: when `link` is a string and the content resolves
  // to a plain string containing it, split the copy and embed the substring
  // as a styled, tappable inline `<RNText>`. Falls through to the trailing
  // slot (Layers `_linkText-slot`) for any other shape.
  const linkPaint = useSurfaceTokens('primary');
  const inlineLinkContent = useMemo(
    () => buildContentWithInlineLink(content, props.link, props.onLinkPress, linkPaint.content.tintedA11y),
    [content, props.link, props.onLinkPress, linkPaint.content.tintedA11y],
  );

  // The rendered link (inline substring or trailing slot) owns the sole `link`
  // role. Tell the a11y resolver so the parent is not promoted to `link` too —
  // nesting links is invalid and breaks `getByRole('link')`.
  const a11y = getTextAccessibilityProps(props, state, {
    hasRenderedLink: inlineLinkContent.hasRenderedLink,
  });

  return (
    <RNText
      {...a11y}
      {...(resolvedLang ? { accessibilityLanguage: resolvedLang } : null)}
      testID={props.testID}
      onPress={props.onPress}
      numberOfLines={props.maxLines && props.maxLines > 0 ? props.maxLines : undefined}
      style={[
        styles.root,
        baseStyle,
        props.textAlign ? ALIGN_STYLE[props.textAlign] : null,
        props.italic && !usesBundledCodeItalicFont ? styles.italic : null,
        decoration,
        props.style,
      ]}
    >
      {inlineLinkContent.body}
      {inlineLinkContent.trailing}
    </RNText>
  );
}

interface InlineLinkRender {
  body: ReactNode;
  /** Fully-built trailing link slot (already wrapped), or null. */
  trailing: ReactNode | null;
  /**
   * True when a `link` element carrying `accessibilityRole="link"` is rendered
   * — either the inline substring in `body` or the interactive trailing slot.
   * The parent Text must then NOT also claim the `link` role (see
   * `getTextAccessibilityProps`) to avoid nested link roles.
   */
  hasRenderedLink: boolean;
}

function buildContentWithInlineLink(
  content: ReactNode,
  link: TextProps['link'],
  onLinkPress: (() => void) | undefined,
  linkColor: string,
): InlineLinkRender {
  if (link == null) return { body: content, trailing: null, hasRenderedLink: false };

  const linkStyle: TextStyle = {
    color: linkColor,
    textDecorationLine: 'underline',
  };

  // Substring case — only when the content is a plain string that contains
  // the link substring. Anything else falls through to the trailing slot.
  if (typeof link === 'string' && typeof content === 'string') {
    const idx = content.indexOf(link);
    if (idx >= 0) {
      const before = content.slice(0, idx);
      const after = content.slice(idx + link.length);
      return {
        body: (
          <>
            {before}
            <RNText
              style={linkStyle}
              onPress={onLinkPress}
              accessibilityRole='link'
              accessible
            >
              {link}
            </RNText>
            {after}
          </>
        ),
        trailing: null,
        hasRenderedLink: true,
      };
    }
  }

  // Trailing slot — a `link` string not found in `content`, or a ReactNode
  // link. When `onLinkPress` is supplied the slot becomes an interactive,
  // accessible link (mirrors the inline case); otherwise it would be a dead
  // link, so we leave it as plain trailing content with no `link` role.
  const isInteractive = typeof onLinkPress === 'function';
  const trailing = (
    <RNText
      style={[styles.linkSlot, typeof link === 'string' ? linkStyle : null]}
      onPress={onLinkPress}
      {...(isInteractive ? { accessibilityRole: 'link' as const, accessible: true } : null)}
    >
      {link}
    </RNText>
  );

  return { body: content, trailing, hasRenderedLink: isInteractive };
}

Text.displayName = 'Text';

function pickDecoration(
  underline: boolean | undefined,
  strikethrough: boolean | undefined,
): TextStyle | null {
  if (underline && strikethrough) return styles.underlineStrikethrough;
  if (underline) return styles.underline;
  if (strikethrough) return styles.strikethrough;
  return null;
}

export type { TextProps, TextNativeProps } from './interface';
export type { TextAppearance, TextWeight };
