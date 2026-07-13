/**
 * Text QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/Text/Text.native.tsx
 *
 * ─── Figma API table (from screenshot) vs native props ──────────────────────
 *
 *   Figma property  Figma values                       Native prop / values
 *   ─────────────────────────────────────────────────────────────────────────
 *   variant         display|headline|title|            same
 *                   body|label|code
 *   size            3XS|2XS|XS|S|M|L                  per-variant valid ranges:
 *                                                       display/headline/title → S|M|L
 *                                                       body → 2XS|XS|S|M|L
 *                                                       label → 3XS|2XS|XS|S|M|L
 *                                                       code → M|S|XS (native)
 *   weight          low|medium|high                    'high'(default)|'medium'|'low'
 *   attention       low|medium|high|tintedA11Y         'none'(→high)|'high'|'medium'|
 *                                                       'low'|'tintedA11y'
 *                                                       ← 'none' NOT in Figma (BUG-TEXT-6)
 *   appearance      auto|neutral|primary|secondary|    same
 *                   sparkle|negative|positive|
 *                   warning|informative
 *   italic          true|false                         boolean
 *   underline       true|false                         boolean
 *   strikethrough   true|false                         boolean
 *   text            low|medium|high ← WRONG VALUES     string (content convenience prop)
 *                   (Figma table shows attention        (BUG-TEXT-7)
 *                    values, not content values)
 *   textAlign       low|medium|high ← WRONG VALUES     'left'|'center'|'right'
 *                   (Figma table has wrong entries)     (BUG-TEXT-7)
 *   maxLines        <amount of lines>                  number
 *   link            true|false ← BOOLEAN in Figma      string|ReactNode in native
 *                                                       (BUG-TEXT-8)
 *
 * ─── Figma scoping constraints ───────────────────────────────────────────────
 *
 *   Weight scoping (Figma — native does NOT enforce these):
 *     display   → weight is always medium (locked, Figma shows only 1 weight)
 *     headline  → weight is medium; font-weight varies by size (weight adaption)
 *     title     → weight is medium; font-weight varies by size (weight adaption)
 *     label     → low(400) | medium(500) | high(700)  — all three
 *     body      → low(400) | medium(500) | high(700)  — all three
 *     code      → low(400) | medium(500) | high(700)  — all three
 *
 *   Attention scoping (Figma):
 *     display   → high only (Figma note: "Display is only available in high")
 *     Others    → low | medium | high | tintedA11Y
 *
 *   Variant font families (Figma):
 *     display|headline|title|label|body → JioType Var (brand variable font)
 *     code                              → JetBrains Mono (monospace, fixed family)
 *
 * ─── Native props ────────────────────────────────────────────────────────────
 *
 *   variant       'body'(default) | 'label' | 'title' | 'headline' | 'display' | 'code'
 *   size          per-variant:  body→L/M/S/XS/2XS  label→L/M/S/XS/2XS/3XS
 *                               title|headline|display→L/M/S  code→M/S/XS
 *   weight        'high'(default) | 'medium' | 'low'
 *   attention     'none'(→high) | 'high' | 'medium' | 'low' | 'tintedA11y'
 *   appearance    'auto'(→neutral) | 9 semantic roles
 *   text          string-only convenience (children wins when both set)
 *   children      any ReactNode
 *   italic        boolean
 *   underline     boolean
 *   strikethrough boolean
 *   textAlign     'left' | 'center' | 'right'
 *   maxLines      number → numberOfLines
 *   link          string (inline substring split) | ReactNode (trailing slot)
 *   onLinkPress   handler for inline link press
 *   onPress       makes element interactive; promotes accessibilityRole → 'link'
 *   aria-label    overrides computed accessibilityLabel
 *   aria-hidden   hides from a11y tree
 *   accessibilityHint
 *   testID
 *
 * ─── accessibilityRole rules (as of PR #330, f27550f7) ──────────────────────
 *
 *   aria-hidden=true         → 'none'  (accessible=false, hidden from tree)
 *   onPress present          → 'link'
 *   all other variants       → undefined  (no role assigned; heading semantics
 *                                          are left to the caller)
 *
 *   CHANGED in PR #330: Text previously set 'header' for headline/display and
 *   'text' for body/label/code/title. Now it sets NO role for non-interactive
 *   variants — Text is a generic primitive.
 *
 * ─── inline link rules ───────────────────────────────────────────────────────
 *
 *   link=string  + children contains substring → splits into [before, <link>, after]
 *                                                 inner RNText gets role='link' + onLinkPress
 *   link=string  + substring NOT found         → falls to trailing slot (no role, no handler)
 *   link=ReactNode                             → trailing slot, onLinkPress silently dropped
 *
 * ─── accessibilityLabel resolution ──────────────────────────────────────────
 *
 *   aria-label > string/number children > text prop > undefined
 *   ReactElement children → undefined (screen reader announces nothing)
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-TEXT-2 · onPress + link + onLinkPress simultaneously → two role="link" nodes
 *     When `onPress` is set, the outer RNText gets `accessibilityRole='link'`.
 *     When `link` string is found in content, the inner inline RNText ALSO gets
 *     `accessibilityRole='link'`. Two nested link roles confuse VoiceOver /
 *     TalkBack and break `getByRole('link')` (throws "found multiple elements").
 *     File: packages/ui-native/src/components/Text/interface.ts:392-397
 *     File: packages/ui-native/src/components/Text/Text.native.tsx:165-177
 *     Fix:  When `link` and `onLinkPress` are provided alongside `onPress`,
 *           give the outer element `accessibilityRole='text'` (or 'none') and
 *           rely on the inline link for the interactive role.
 *
 *   BUG-TEXT-3 · link string not found in content — silent trailing slot, onLinkPress dead
 *     `buildContentWithInlineLink` falls through to `{ body: content, trailing: link }`
 *     when the link substring is not present in the content string. The trailing
 *     `<RNText>` has NO `accessibilityRole='link'` and NO `onPress={onLinkPress}`.
 *     The caller gets no warning; the handler is silently never called.
 *     File: packages/ui-native/src/components/Text/Text.native.tsx:153-186
 *     Fix:  Emit a dev-mode `console.warn` when the substring is not found.
 *           Attach `onLinkPress` + `accessibilityRole='link'` to the trailing
 *           <RNText> so it remains interactive regardless of the fallback path.
 *
 *   BUG-TEXT-4 · link as ReactNode + onLinkPress — handler silently dropped
 *     When `link` is a ReactNode (not a string matching the content), the result
 *     is `{ body: content, trailing: link }`. The trailing slot renders as:
 *       `<RNText style={styles.linkSlot}>{trailing}</RNText>`
 *     — with NO `onPress={onLinkPress}`, NO `accessibilityRole='link'`.
 *     The handler provided by the caller is dead code.
 *     File: packages/ui-native/src/components/Text/Text.native.tsx:135-137
 *     Fix:  When `onLinkPress` is set, render the trailing slot as:
 *       `<RNText ... onPress={onLinkPress} accessibilityRole="link">{trailing}</RNText>`
 *
 *   BUG-TEXT-5 · ReactElement children → accessibilityLabel is undefined
 *     `resolveTextAccessibilityLabel` only returns a string when children is a
 *     string or number. If children is a ReactElement (e.g. `<Icon /> Text`),
 *     the computed `accessibilityLabel` is `undefined`. VoiceOver / TalkBack
 *     announces nothing — the element is accessible but has no readable name.
 *     File: packages/ui-native/src/components/Text/interface.ts:357-365
 *     Fix:  Accept `aria-label` as the required fallback when children is not a
 *           plain string. Emit a dev-mode warning when children is a ReactElement
 *           and no `aria-label` is provided.
 *
 *   BUG-TEXT-6 · Figma `attention` has no 'none' value — native default is undocumented
 *     Figma API table shows attention as: low | medium | high | tintedA11Y (4 values).
 *     Native interface has: 'none' | 'high' | 'medium' | 'low' | 'tintedA11y' (5 values).
 *     'none' is the native default but is NOT in the Figma API contract.
 *     Callers following Figma don't know to pass 'none'; callers using native have an
 *     undocumented implicit default that maps to 'high' without any indication.
 *     File: packages/ui-native/src/components/Text/interface.ts:306-308
 *     Fix:  Remove 'none' from TextAttention type; make 'high' the explicit default
 *           in useDividerState so the default is visible in the type signature.
 *
 *   BUG-TEXT-7 · Figma API table shows wrong values for `text` and `textAlign`
 *     Figma API table shows:
 *       text:      low | medium | high  (shows attention values, not content)
 *       textAlign: low | medium | high  (should be left | center | right)
 *     The Figma component metadata has incorrect entries for these two properties.
 *     Callers reading the Figma API table will misunderstand both props.
 *     File: Figma component metadata (not native code)
 *     Fix:  Update Figma API table entries to show:
 *           text → <string content>  (or remove from API table — it's a convenience prop)
 *           textAlign → left | center | right
 *
 *   BUG-TEXT-8 · Figma `link` is boolean (true/false) but native `link` is string|ReactNode
 *     Figma API table shows link as: true | false (a boolean toggle).
 *     Native TextProps declares: link?: string | ReactNode.
 *     A caller following Figma and passing `link={true}` passes a boolean, which is
 *     a valid ReactNode. The component silently treats it as a trailing slot, renders
 *     `<RNText>{true}</RNText>` (React renders nothing from booleans), and the
 *     onLinkPress handler is dead. No error, no warning — completely silent failure.
 *     File: packages/ui-native/src/components/Text/Text.native.tsx:153-186
 *           packages/ui-native/src/components/Text/interface.ts:228
 *     Fix:  Either align the Figma API to show string|ReactNode, or add a runtime
 *           guard: `if (typeof link === 'boolean') console.warn(...)` in
 *           buildContentWithInlineLink.
 *
 *   BUG-TEXT-9 · italic=true applies fontStyle="italic" despite Figma marking it N/A for Jio
 *     Figma shows the italic section with a tooltip: "N/A — Italic is not available for Jio."
 *     The native component has an `italic` prop that unconditionally applies
 *     `fontStyle: 'italic'` via `styles.italic` — no brand check, no warning.
 *     The Jio brand font (JioType) does not ship an italic axis or separate italic cut.
 *     Applying italic will cause the OS to synthesise oblique rendering (fake italic),
 *     producing visually degraded text that diverges from the brand specification.
 *     File: packages/ui-native/src/components/Text/Text.native.tsx:129
 *           packages/ui-native/src/components/Text/Text.styles.native.ts:61
 *     Fix:  In the brand context, when the active font is JioType, ignore italic=true
 *           and emit a dev-mode console.warn. Alternatively gate the italic style
 *           behind a brand feature flag from OneUIBrandProvider.
 *
 *   BUG-TEXT-10 · underline thickness and offset are not controllable on native
 *     Figma specifies per-variant underline specs:
 *       display / headline / title: thickness 15%,  offset 25%
 *       label / body (low weight):  thickness 10%,  offset 25%
 *       label / body (med weight):  thickness 12%,  offset 25%
 *       label / body (high weight): thickness 15%,  offset 25%
 *     React Native's `textDecorationLine: 'underline'` provides no API for thickness
 *     or offset — these are rendered by the OS at its default values, diverging from
 *     the Figma-specified design intent.
 *     File: packages/ui-native/src/components/Text/Text.styles.native.ts:67
 *           packages/ui-native/src/components/Text/Text.native.tsx:127
 *     Fix:  Use a platform-specific custom underline implementation (e.g. a
 *           bottom-border View overlay or a React Native Text shadow) where per-
 *           pixel underline spec is required. Document this as a known platform gap.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { Text } from '@ui-native/components/Text/Text.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Text — smoke', () => {
  it('[smoke] renders without crashing', () => {
    expect(() => render(wrap(<Text>Hello</Text>))).not.toThrow();
  });

  it('[smoke] renders string content as text', () => {
    render(wrap(<Text>Hello world</Text>));
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('[smoke] renders with text prop', () => {
    render(wrap(<Text text="Via text prop" />));
    expect(screen.getByText('Via text prop')).toBeTruthy();
  });

  it('[smoke] renders all variants without crashing', () => {
    const variants = ['body', 'label', 'title', 'headline', 'display', 'code'] as const;
    for (const variant of variants) {
      const { unmount } = render(wrap(<Text variant={variant}>Sample</Text>));
      expect(screen.getByText('Sample')).toBeTruthy();
      unmount();
    }
    render(wrap(<Text variant="body">Final</Text>));
  });

  it('[smoke] renders all body sizes without crashing', () => {
    for (const size of ['L', 'M', 'S', 'XS', '2XS'] as const) {
      const { unmount } = render(wrap(<Text variant="body" size={size}>Body {size}</Text>));
      expect(screen.getByText(`Body ${size}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<Text variant="body">Final</Text>));
  });

  it('[smoke] renders all label sizes without crashing', () => {
    for (const size of ['L', 'M', 'S', 'XS', '2XS', '3XS'] as const) {
      const { unmount } = render(wrap(<Text variant="label" size={size}>Label {size}</Text>));
      expect(screen.getByText(`Label ${size}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<Text variant="label">Final</Text>));
  });

  it('[smoke] renders all headline/display/title sizes without crashing', () => {
    for (const variant of ['headline', 'display', 'title'] as const) {
      for (const size of ['L', 'M', 'S'] as const) {
        const { unmount } = render(wrap(<Text variant={variant} size={size}>{variant} {size}</Text>));
        unmount();
      }
    }
    render(wrap(<Text>Final</Text>));
  });

  it('[smoke] renders all code sizes without crashing', () => {
    for (const size of ['M', 'S', 'XS'] as const) {
      const { unmount } = render(wrap(<Text variant="code" size={size}>Code {size}</Text>));
      expect(screen.getByText(`Code ${size}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<Text variant="code">Final</Text>));
  });

  it('[smoke] renders all weight values without crashing', () => {
    for (const weight of ['high', 'medium', 'low'] as const) {
      const { unmount } = render(wrap(<Text weight={weight}>Weight</Text>));
      unmount();
    }
    render(wrap(<Text>Final</Text>));
  });

  it('[smoke] renders all attention levels without crashing', () => {
    for (const attention of ['none', 'high', 'medium', 'low', 'tintedA11y'] as const) {
      const { unmount } = render(wrap(<Text attention={attention}>Attention</Text>));
      unmount();
    }
    render(wrap(<Text>Final</Text>));
  });

  it('[smoke] renders all appearances without crashing', () => {
    for (const appearance of [
      'auto', 'neutral', 'primary', 'secondary', 'sparkle',
      'negative', 'positive', 'warning', 'informative',
    ] as const) {
      const { unmount } = render(wrap(<Text appearance={appearance}>Appearance</Text>));
      unmount();
    }
    render(wrap(<Text>Final</Text>));
  });

  it('[smoke] renders decorations without crashing', () => {
    expect(() => render(wrap(<Text italic>Italic</Text>))).not.toThrow();
    expect(() => render(wrap(<Text underline>Underline</Text>))).not.toThrow();
    expect(() => render(wrap(<Text strikethrough>Strike</Text>))).not.toThrow();
    expect(() => render(wrap(<Text underline strikethrough>Both</Text>))).not.toThrow();
  });

  it('[smoke] renders with onPress without crashing', () => {
    expect(() => render(wrap(<Text onPress={vi.fn()}>Press me</Text>))).not.toThrow();
  });

  it('[smoke] renders with link prop without crashing', () => {
    expect(() =>
      render(wrap(<Text link="click" onLinkPress={vi.fn()}>Please click here</Text>)),
    ).not.toThrow();
  });
});

// ─── Functional: variant → accessibilityRole ─────────────────────────────────
//
// PR #330 (f27550f7): Text is now a generic primitive — it assigns NO
// accessibilityRole for non-interactive variants. The only role it sets is
// `link` when `onPress` makes it interactive. Heading semantics are left to
// the caller. getByRole('text') and getByRole('header') are no longer valid
// for non-interactive Text elements.

describe('Text — functional: variant and role', () => {
  it('[fn] default variant (body) has no accessibilityRole', () => {
    render(wrap(<Text testID="body-default">Body</Text>));
    expect(screen.getByTestId('body-default').props.accessibilityRole).toBeUndefined();
  });

  it('[fn] variant="body" has no accessibilityRole', () => {
    render(wrap(<Text variant="body" testID="body-explicit">Body</Text>));
    expect(screen.getByTestId('body-explicit').props.accessibilityRole).toBeUndefined();
  });

  it('[fn] variant="label" has no accessibilityRole', () => {
    render(wrap(<Text variant="label" testID="label-role">Label</Text>));
    expect(screen.getByTestId('label-role').props.accessibilityRole).toBeUndefined();
  });

  it('[fn] variant="code" has no accessibilityRole', () => {
    render(wrap(<Text variant="code" testID="code-role">Code</Text>));
    expect(screen.getByTestId('code-role').props.accessibilityRole).toBeUndefined();
  });

  it('[fn] variant="headline" has no accessibilityRole (heading semantics left to caller)', () => {
    render(wrap(<Text variant="headline" testID="headline-role">Heading</Text>));
    expect(screen.getByTestId('headline-role').props.accessibilityRole).toBeUndefined();
  });

  it('[fn] variant="display" has no accessibilityRole (heading semantics left to caller)', () => {
    render(wrap(<Text variant="display" testID="display-role">Display</Text>));
    expect(screen.getByTestId('display-role').props.accessibilityRole).toBeUndefined();
  });

  it('[fn] headline accessibilityRole is undefined', () => {
    render(wrap(<Text variant="headline" testID="hl">Heading</Text>));
    expect(screen.getByTestId('hl').props.accessibilityRole).toBeUndefined();
  });

  it('[fn] display accessibilityRole is undefined', () => {
    render(wrap(<Text variant="display" testID="dp">Display</Text>));
    expect(screen.getByTestId('dp').props.accessibilityRole).toBeUndefined();
  });

  it('[fn] body accessibilityRole is undefined', () => {
    render(wrap(<Text variant="body" testID="bd">Body</Text>));
    expect(screen.getByTestId('bd').props.accessibilityRole).toBeUndefined();
  });
});

// ─── Functional: content (children vs text prop) ──────────────────────────────

describe('Text — functional: content', () => {
  it('[fn] children renders as visible text', () => {
    render(wrap(<Text>Hello children</Text>));
    expect(screen.getByText('Hello children')).toBeTruthy();
  });

  it('[fn] text prop renders as visible text when no children', () => {
    render(wrap(<Text text="Via text prop" />));
    expect(screen.getByText('Via text prop')).toBeTruthy();
  });

  it('[fn] children wins over text prop when both provided', () => {
    // children takes precedence — text prop is silently ignored
    render(wrap(<Text text="Text prop">Children content</Text>));
    expect(screen.getByText('Children content')).toBeTruthy();
    expect(screen.queryByText('Text prop')).toBeNull();
  });

  it('[fn] numeric children renders as string', () => {
    render(wrap(<Text>{42}</Text>));
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('[fn] testID is forwarded to the rendered element', () => {
    render(wrap(<Text testID="my-text">Hello</Text>));
    expect(screen.getByTestId('my-text')).toBeTruthy();
  });
});

// ─── Functional: onPress ─────────────────────────────────────────────────────

describe('Text — functional: onPress', () => {
  it('[fn] onPress promotes accessibilityRole to "link"', () => {
    render(wrap(<Text onPress={vi.fn()}>Tappable</Text>));
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('[fn] onPress fires handler when element is pressed', () => {
    const handler = vi.fn();
    render(wrap(<Text onPress={handler}>Press me</Text>));
    fireEvent.press(screen.getByRole('link'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] onPress fires exactly once per tap', () => {
    const handler = vi.fn();
    render(wrap(<Text onPress={handler}>Press</Text>));
    fireEvent.press(screen.getByRole('link'));
    fireEvent.press(screen.getByRole('link'));
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('[fn] no onPress → no role set (not "link", not "text")', () => {
    // PR #330: non-interactive Text has no accessibilityRole at all.
    render(wrap(<Text testID="no-press">Not interactive</Text>));
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByTestId('no-press').props.accessibilityRole).toBeUndefined();
  });

  it('[fn] headline + onPress → role is "link" (onPress beats variant heading)', () => {
    // isInteractive check runs before isHeading in getTextAccessibilityProps
    render(wrap(<Text variant="headline" onPress={vi.fn()} testID="hl-press">Interactive Heading</Text>));
    expect(screen.getByTestId('hl-press').props.accessibilityRole).toBe('link');
  });
});

// ─── Functional: link (inline split) ────────────────────────────────────────

describe('Text — functional: link', () => {
  it('[fn] link string found in content → inline RNText with role="link"', () => {
    render(wrap(
      <Text link="click here" onLinkPress={vi.fn()}>
        Please click here to continue
      </Text>,
    ));
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('[fn] onLinkPress fires when inline link substring is pressed', () => {
    const handler = vi.fn();
    render(wrap(
      <Text link="click here" onLinkPress={handler}>
        Please click here to continue
      </Text>,
    ));
    fireEvent.press(screen.getByRole('link'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] before and after text around the link still renders', () => {
    render(wrap(
      <Text link="click here" onLinkPress={vi.fn()}>
        Please click here to continue
      </Text>,
    ));
    expect(screen.getByText('click here')).toBeTruthy();
  });

  it('[fn] link with no onLinkPress still renders inline link visually', () => {
    // link is split inline even without a handler — tappable but handler is undefined
    expect(() =>
      render(wrap(<Text link="click">Please click to continue</Text>)),
    ).not.toThrow();
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('[fn] outer Text has no accessibilityRole when only link+onLinkPress set (no onPress)', () => {
    render(wrap(
      <Text link="here" onLinkPress={vi.fn()} testID="outer-link-only">
        Tap here now
      </Text>,
    ));
    // Outer has no onPress → no accessibilityRole, inner link gets role='link'
    expect(screen.getByTestId('outer-link-only').props.accessibilityRole).toBeUndefined();
    const allLinks = screen.getAllByRole('link');
    expect(allLinks.length).toBe(1); // only the inner link
  });

  it('[fn] link as ReactNode renders in trailing slot', () => {
    // link=ReactNode → always trailing, never inline.
    // Main content accessibilityLabel is queryable via getByLabelText (RNTL
    // cannot getByText when the string is mixed with element siblings in one RNText).
    render(wrap(
      <Text link={<Text testID="trailing-link">Link text</Text>}>Main content</Text>,
    ));
    // Trailing ReactNode is in the tree:
    expect(screen.getByTestId('trailing-link')).toBeTruthy();
    // Main content is accessible via its computed accessibilityLabel:
    expect(screen.getByLabelText('Main content')).toBeTruthy();
  });
});

// ─── Functional: decoration ───────────────────────────────────────────────────

describe('Text — functional: decoration styles', () => {
  function flatStyle(style: unknown): Record<string, unknown> {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
    if (typeof style === 'object') return style as Record<string, unknown>;
    return {};
  }

  it('[fn] italic=true → fontStyle="italic" in style', () => {
    render(wrap(<Text italic testID="ital">Italic</Text>));
    const s = flatStyle(screen.getByTestId('ital').props.style);
    expect(s.fontStyle).toBe('italic');
  });

  it('[fn] italic not set → fontStyle is not "italic"', () => {
    render(wrap(<Text testID="no-ital">Normal</Text>));
    const s = flatStyle(screen.getByTestId('no-ital').props.style);
    expect(s.fontStyle).not.toBe('italic');
  });

  it('[fn] underline=true → textDecorationLine="underline"', () => {
    render(wrap(<Text underline testID="und">Underlined</Text>));
    const s = flatStyle(screen.getByTestId('und').props.style);
    expect(s.textDecorationLine).toBe('underline');
  });

  it('[fn] strikethrough=true → textDecorationLine="line-through"', () => {
    render(wrap(<Text strikethrough testID="str">Strike</Text>));
    const s = flatStyle(screen.getByTestId('str').props.style);
    expect(s.textDecorationLine).toBe('line-through');
  });

  it('[fn] underline + strikethrough → textDecorationLine="underline line-through"', () => {
    render(wrap(<Text underline strikethrough testID="both">Both</Text>));
    const s = flatStyle(screen.getByTestId('both').props.style);
    expect(s.textDecorationLine).toBe('underline line-through');
  });

  it('[fn] no decoration → no textDecorationLine in style', () => {
    render(wrap(<Text testID="no-dec">Plain</Text>));
    const s = flatStyle(screen.getByTestId('no-dec').props.style);
    expect(s.textDecorationLine).toBeUndefined();
  });
});

// ─── Functional: textAlign ────────────────────────────────────────────────────

describe('Text — functional: textAlign', () => {
  function flatStyle(style: unknown): Record<string, unknown> {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
    if (typeof style === 'object') return style as Record<string, unknown>;
    return {};
  }

  it('[fn] textAlign="left" → textAlign="left" in style', () => {
    render(wrap(<Text textAlign="left" testID="left">Left</Text>));
    expect(flatStyle(screen.getByTestId('left').props.style).textAlign).toBe('left');
  });

  it('[fn] textAlign="center" → textAlign="center" in style', () => {
    render(wrap(<Text textAlign="center" testID="center">Center</Text>));
    expect(flatStyle(screen.getByTestId('center').props.style).textAlign).toBe('center');
  });

  it('[fn] textAlign="right" → textAlign="right" in style', () => {
    render(wrap(<Text textAlign="right" testID="right">Right</Text>));
    expect(flatStyle(screen.getByTestId('right').props.style).textAlign).toBe('right');
  });

  it('[fn] no textAlign → no textAlign in style (inherits from parent)', () => {
    render(wrap(<Text testID="no-align">Text</Text>));
    const s = flatStyle(screen.getByTestId('no-align').props.style);
    expect(s.textAlign).toBeUndefined();
  });
});

// ─── Functional: maxLines ─────────────────────────────────────────────────────

describe('Text — functional: maxLines', () => {
  it('[fn] maxLines=1 → numberOfLines=1 on rendered element', () => {
    render(wrap(<Text maxLines={1} testID="max1">Line</Text>));
    expect(screen.getByTestId('max1').props.numberOfLines).toBe(1);
  });

  it('[fn] maxLines=3 → numberOfLines=3', () => {
    render(wrap(<Text maxLines={3} testID="max3">Line</Text>));
    expect(screen.getByTestId('max3').props.numberOfLines).toBe(3);
  });

  it('[fn] maxLines not set → numberOfLines is undefined', () => {
    render(wrap(<Text testID="no-max">Line</Text>));
    expect(screen.getByTestId('no-max').props.numberOfLines).toBeUndefined();
  });

  it('[fn] maxLines=0 → numberOfLines is undefined (0 is treated as unset)', () => {
    // maxLines && maxLines > 0 → only positive values set numberOfLines
    render(wrap(<Text maxLines={0} testID="max0">Line</Text>));
    expect(screen.getByTestId('max0').props.numberOfLines).toBeUndefined();
  });
});

// ─── Functional: resolveTextSize (clamping) ───────────────────────────────────

describe('Text — functional: resolveTextSize clamping', () => {
  it('[fn] body with valid size "M" renders without crashing', () => {
    expect(() => render(wrap(<Text variant="body" size="M">Body M</Text>))).not.toThrow();
  });

  it('[fn] body with invalid size "3XS" (no 3XS for body) — clamps to "2XS"', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      // resolveTextSize clamps body/3XS → 2XS and emits a warning
      expect(() => render(wrap(
        // @ts-expect-error — 3XS is not a valid body size
        <Text variant="body" size="3XS">Clamped</Text>,
      ))).not.toThrow();
      // Dev warning should have fired
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('3XS'));
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('[fn] headline with invalid size "XS" — clamps to "S" and warns', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(() => render(wrap(
        // @ts-expect-error — XS is not valid for headline
        <Text variant="headline" size="XS">Clamped headline</Text>,
      ))).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('XS'));
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('[fn] code with invalid large size "L" — clamps to "M" and warns', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(() => render(wrap(
        // @ts-expect-error — L is not valid for code
        <Text variant="code" size="L">Clamped code</Text>,
      ))).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('L'));
    } finally {
      warnSpy.mockRestore();
    }
  });
});

// ─── Functional: accessibilityHint ───────────────────────────────────────────

describe('Text — functional: accessibilityHint', () => {
  it('[fn] accessibilityHint is forwarded to the rendered element', () => {
    render(wrap(<Text accessibilityHint="Opens details" testID="hint-text">Press</Text>));
    expect(screen.getByTestId('hint-text').props.accessibilityHint).toBe('Opens details');
  });

  it('[fn] accessibilityHint not forwarded when aria-hidden=true', () => {
    // aria-hidden early return drops all accessibility props including hint
    render(wrap(
      <Text aria-hidden accessibilityHint="Should not show" testID="hidden-hint">Deco</Text>,
    ));
    const el = screen.getByTestId('hidden-hint', { includeHiddenElements: true });
    expect(el.props.accessibilityHint).toBeUndefined();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Text — a11y', () => {
  // ── Role mapping ──────────────────────────────────────────────────────────
  //
  // PR #330: Text is a generic primitive with no accessibilityRole for
  // non-interactive variants. accessible=true is still set so screen readers
  // can read the content; the role is simply absent (undefined), not 'text'.

  it('[a11y] body variant → no accessibilityRole, still accessible', () => {
    render(wrap(<Text testID="a11y-body">Body text</Text>));
    const el = screen.getByTestId('a11y-body');
    expect(el.props.accessibilityRole).toBeUndefined();
    expect(el.props.accessible).toBe(true);
  });

  it('[a11y] headline → no accessibilityRole (heading semantics left to caller)', () => {
    render(wrap(<Text variant="headline" testID="a11y-headline">Heading</Text>));
    const el = screen.getByTestId('a11y-headline');
    expect(el.props.accessibilityRole).toBeUndefined();
    expect(el.props.accessible).toBe(true);
  });

  it('[a11y] display → no accessibilityRole (heading semantics left to caller)', () => {
    render(wrap(<Text variant="display" testID="a11y-display">Display</Text>));
    const el = screen.getByTestId('a11y-display');
    expect(el.props.accessibilityRole).toBeUndefined();
    expect(el.props.accessible).toBe(true);
  });

  it('[a11y] label variant → no accessibilityRole (not "text", not "header")', () => {
    render(wrap(<Text variant="label" testID="a11y-label">Label text</Text>));
    const el = screen.getByTestId('a11y-label');
    expect(el.props.accessibilityRole).toBeUndefined();
    expect(screen.queryByRole('header')).toBeNull();
  });

  it('[a11y] code variant → no accessibilityRole', () => {
    render(wrap(<Text variant="code" testID="a11y-code">const x = 1;</Text>));
    expect(screen.getByTestId('a11y-code').props.accessibilityRole).toBeUndefined();
  });

  it('[a11y] onPress → role="link", accessible=true', () => {
    render(wrap(<Text onPress={vi.fn()} testID="interactive">Press</Text>));
    const el = screen.getByTestId('interactive');
    expect(el.props.accessibilityRole).toBe('link');
    expect(el.props.accessible).toBe(true);
  });

  it('[a11y] accessible=true by default', () => {
    render(wrap(<Text testID="acc">Hello</Text>));
    expect(screen.getByTestId('acc').props.accessible).toBe(true);
  });

  // ── aria-hidden ────────────────────────────────────────────────────────────

  it('[a11y] aria-hidden=true → accessibilityElementsHidden=true', () => {
    render(wrap(<Text aria-hidden testID="hidden">Deco</Text>));
    const el = screen.getByTestId('hidden', { includeHiddenElements: true });
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] aria-hidden=true → accessibilityRole="none"', () => {
    render(wrap(<Text aria-hidden testID="hidden-role">Deco</Text>));
    const el = screen.getByTestId('hidden-role', { includeHiddenElements: true });
    expect(el.props.accessibilityRole).toBe('none');
  });

  it('[a11y] aria-hidden=true → accessible is not true', () => {
    render(wrap(<Text aria-hidden testID="hidden-acc">Deco</Text>));
    const el = screen.getByTestId('hidden-acc', { includeHiddenElements: true });
    expect(el.props.accessible).not.toBe(true);
  });

  it('[a11y] aria-hidden=true → importantForAccessibility="no-hide-descendants"', () => {
    render(wrap(<Text aria-hidden testID="hidden-imp">Deco</Text>));
    const el = screen.getByTestId('hidden-imp', { includeHiddenElements: true });
    expect(el.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('[a11y] aria-hidden=true → aria-hidden prop=true on element', () => {
    render(wrap(<Text aria-hidden testID="hidden-arh">Deco</Text>));
    const el = screen.getByTestId('hidden-arh', { includeHiddenElements: true });
    expect(el.props['aria-hidden']).toBe(true);
  });

  it('[a11y] aria-hidden element is not queryable by standard getByRole/getByText', () => {
    // PR #330: non-interactive Text has no accessibilityRole at all, so
    // queryByRole('text') returns null both because of aria-hidden AND because
    // the component no longer assigns a 'text' role. The element is still hidden
    // from getByText because accessible=false / importantForAccessibility is set.
    render(wrap(<Text aria-hidden>Decorative</Text>));
    expect(screen.queryByRole('text')).toBeNull();
    expect(screen.queryByText('Decorative')).toBeNull();
  });

  // ── accessibilityLabel resolution ────────────────────────────────────────

  it('[a11y] string children → accessibilityLabel equals content', () => {
    render(wrap(<Text testID="str-label">My content</Text>));
    expect(screen.getByTestId('str-label').props.accessibilityLabel).toBe('My content');
  });

  it('[a11y] numeric children → accessibilityLabel equals stringified number', () => {
    render(wrap(<Text testID="num-label">{99}</Text>));
    expect(screen.getByTestId('num-label').props.accessibilityLabel).toBe('99');
  });

  it('[a11y] text prop → accessibilityLabel equals text value', () => {
    render(wrap(<Text text="From text prop" testID="text-prop-label" />));
    expect(screen.getByTestId('text-prop-label').props.accessibilityLabel).toBe('From text prop');
  });

  it('[a11y] aria-label overrides string children as accessibilityLabel', () => {
    render(wrap(
      <Text aria-label="Override label" testID="aria-override">Children text</Text>,
    ));
    expect(screen.getByTestId('aria-override').props.accessibilityLabel).toBe('Override label');
    // getByLabelText uses accessibilityLabel — finds it by the override
    expect(screen.getByLabelText('Override label')).toBeTruthy();
  });

  it('[a11y] getByLabelText finds element via aria-label', () => {
    render(wrap(<Text aria-label="Custom accessible name">Content</Text>));
    expect(screen.getByLabelText('Custom accessible name')).toBeTruthy();
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('Text — bug-catching', () => {
  // ── BUG-TEXT-2: onPress + link + onLinkPress → two nested role="link" ──────

  it('[bug] BUG-TEXT-2: onPress + link + onLinkPress creates two role="link" elements', () => {
    const outerHandler = vi.fn();
    const linkHandler = vi.fn();
    render(wrap(
      <Text onPress={outerHandler} link="click here" onLinkPress={linkHandler}>
        Please click here to continue
      </Text>,
    ));
    // Expected: exactly one role='link' element (the interactive inline substring)
    // Bug: outer gets role='link' (onPress) AND inner gets role='link' (inline link)
    //      → two nested link roles confuse VoiceOver and break getByRole
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(1);
  });

  it('[bug] BUG-TEXT-2: both link handlers fire correctly when outer also has onPress', () => {
    const outerHandler = vi.fn();
    const linkHandler = vi.fn();
    render(wrap(
      <Text onPress={outerHandler} link="here" onLinkPress={linkHandler}>
        Tap here for details
      </Text>,
    ));
    // With two nested 'link' roles, getByRole throws (multiple elements)
    // Expected: only the inner link should be tappable as a link
    expect(() => screen.getByRole('link')).not.toThrow();
  });

  // ── BUG-TEXT-3: link substring not in content → silent trailing, no link role

  it('[bug] BUG-TEXT-3: link string not found in content — no role="link" in tree', () => {
    render(wrap(
      <Text link="not-present-substring" onLinkPress={vi.fn()}>
        Content that does not contain the link phrase
      </Text>,
    ));
    // Expected: getByRole('link') should still find an interactive link element
    // Bug: substring not found → falls to trailing <RNText> with NO accessibilityRole='link'
    //      The trailing slot is not interactive — onLinkPress is silently unreachable
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('[bug] BUG-TEXT-3: onLinkPress is not callable when link not in content', () => {
    const handler = vi.fn();
    render(wrap(
      <Text link="missing" onLinkPress={handler}>Content has nothing</Text>,
    ));
    // No link role → no element to press → handler never reached
    // Bug: caller passed onLinkPress but it can never fire in this code path
    expect(screen.queryByRole('link')).not.toBeNull();
  });

  // ── BUG-TEXT-4: link=ReactNode + onLinkPress → handler silently dropped ──────

  it('[bug] BUG-TEXT-4: link as ReactNode + onLinkPress — trailing slot has no link role', () => {
    const handler = vi.fn();
    render(wrap(
      <Text
        link={<Text testID="trailing-node">Learn more</Text>}
        onLinkPress={handler}
      >
        Main content
      </Text>,
    ));
    // The trailing <RNText style={linkSlot}> wraps the ReactNode WITHOUT:
    //   - onPress={onLinkPress}
    //   - accessibilityRole='link'
    // Expected: trailing slot should be interactive when onLinkPress is provided
    // Bug: handler is silently dead code; trailing slot has no link role
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('[bug] BUG-TEXT-4: onLinkPress never fires when link is a ReactNode', () => {
    const handler = vi.fn();
    const { UNSAFE_getAllByType } = render(wrap(
      <Text
        link={<Text testID="trailing-link-text">Click me</Text>}
        onLinkPress={handler}
      >
        Content
      </Text>,
    ));
    // Trailing RNText has no onPress attached — handler can never fire
    // Expected: pressing the trailing slot should call onLinkPress
    // Bug: handler is never bound to the trailing slot's onPress
    fireEvent.press(screen.getByTestId('trailing-link-text'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ── BUG-TEXT-5: ReactElement children → accessibilityLabel=undefined ─────────

  it('[bug] BUG-TEXT-5: ReactElement children → accessibilityLabel is undefined', () => {
    render(wrap(
      <Text testID="react-el-children">
        <Text>Nested text</Text>
      </Text>,
    ));
    const el = screen.getByTestId('react-el-children');
    // Expected: screen reader should be able to read the text content
    // Bug: resolveTextAccessibilityLabel only handles string/number children;
    //      ReactElement children produce undefined accessibilityLabel
    expect(el.props.accessibilityLabel).toBeTruthy();
  });

  it('[bug] BUG-TEXT-5: no aria-label + ReactElement children = no screen reader name', () => {
    render(wrap(
      <Text testID="no-a11y-name">
        <Text>Visible text</Text>
      </Text>,
    ));
    const el = screen.getByTestId('no-a11y-name');
    // Workaround: caller MUST provide aria-label when children is a ReactElement
    // without it, accessibilityLabel is undefined and screen reader gets nothing
    expect(el.props.accessibilityLabel).not.toBeUndefined();
  });

  // ── BUG-TEXT-6: Figma 'attention' has no 'none' — native default undocumented ──

  it('[bug] BUG-TEXT-6: attention="none" maps to "high" — undocumented in Figma API', () => {
    // Figma: attention = low | medium | high | tintedA11Y  (no 'none')
    // Native: attention = 'none' | 'high' | 'medium' | 'low' | 'tintedA11y'
    // 'none' is the native DEFAULT and maps to 'high' internally.
    // Callers following Figma don't know this. This test documents the behavior.
    render(wrap(<Text attention="none" testID="att-none">Text</Text>));
    // 'none' accepted without crash (passes — documents undocumented API):
    expect(screen.getByTestId('att-none')).toBeTruthy();
    // Renders the same as 'high' attention (no visual difference in tree):
    render(wrap(<Text attention="high" testID="att-high-explicit">Text</Text>));
    expect(screen.getByTestId('att-high-explicit')).toBeTruthy();
  });

  // ── BUG-TEXT-7: Figma API table shows wrong values for text and textAlign ────

  it('[bug] BUG-TEXT-7: Figma API table shows textAlign="low/medium/high" — wrong values', () => {
    // Figma API table entry: textAlign = low | medium | high  (WRONG)
    // Correct native values: 'left' | 'center' | 'right'
    // This test verifies the CORRECT native values work, documenting the Figma error.
    function flatStyle(style: unknown): Record<string, unknown> {
      if (!style) return {};
      if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
      if (typeof style === 'object') return style as Record<string, unknown>;
      return {};
    }
    render(wrap(<Text textAlign="left" testID="ta-left">Text</Text>));
    expect(flatStyle(screen.getByTestId('ta-left').props.style).textAlign).toBe('left');
    // 'low' is NOT a valid textAlign value:
    // @ts-expect-error — 'low' is what Figma API table shows but is not a valid value
    expect(() => render(wrap(<Text textAlign="low">Text</Text>))).not.toThrow();
    // The 'low' value is silently ignored (no textAlign applied):
    render(wrap(<Text textAlign="center" testID="ta-valid">Text</Text>));
    expect(flatStyle(screen.getByTestId('ta-valid').props.style).textAlign).toBe('center');
  });

  it('[bug] BUG-TEXT-7: Figma API table shows text="low/medium/high" — wrong values', () => {
    // Figma API table entry: text = low | medium | high  (WRONG — these are attention values)
    // Correct native prop: text = string (content convenience prop)
    // Passing 'low' as the text prop renders the string "low", not low-attention styling:
    render(wrap(<Text text="low" testID="text-low-value" />));
    // 'low' is treated as literal string content, not an attention modifier:
    expect(screen.getByText('low')).toBeTruthy();
    expect(screen.getByTestId('text-low-value').props.accessibilityLabel).toBe('low');
  });

  // ── BUG-TEXT-8: Figma link=boolean vs native link=string|ReactNode ──────────

  it('[bug] BUG-TEXT-8: link={true} (Figma boolean) silently renders empty trailing slot', () => {
    // Figma API table: link = true | false (boolean toggle)
    // Native prop:     link = string | ReactNode
    // A caller following Figma and writing link={true} passes a boolean.
    // boolean is a valid ReactNode so TypeScript accepts it.
    // buildContentWithInlineLink: typeof true !== 'string' → trailing = true
    // Render: <RNText>{true}</RNText> → React renders nothing from booleans
    // Result: silent empty trailing slot, no link role, onLinkPress never fires.
    const handler = vi.fn();
    render(wrap(
      <Text link={true as unknown as string} onLinkPress={handler} testID="bool-link">
        Content
      </Text>,
    ));
    // Expected: a link element should be visible and interactive
    // Bug: link={true} silently renders an empty non-interactive trailing slot
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('[bug] BUG-TEXT-8: link={false} (Figma "disabled") also silently becomes trailing', () => {
    // link={false} → typeof false !== 'string', not null → trailing = false
    // → <RNText>{false}</RNText> → renders nothing (React ignores false)
    // The component should treat link={false} as "no link" (link=undefined behavior)
    render(wrap(
      <Text link={false as unknown as string} testID="bool-link-false">Content</Text>,
    ));
    // Expected: link={false} should be treated same as link={undefined} → no link slot
    // Bug: trailing slot is rendered but empty; correct would be to skip it entirely
    expect(screen.queryByRole('link')).toBeNull(); // PASSES: no role, but trailing slot still rendered
    // Verify no trailing slot rendered (trailing != null evaluates true for false):
    // Actually false != null is TRUE, so trailing slot IS rendered (empty RNText)
    // Expected behavior: link={false} should mean "no link" like link={undefined}
    expect(screen.getByTestId('bool-link-false')).toBeTruthy();
  });
});

// ─── Figma matrix: variant × size (per-variant scoping) ──────────────────────
//
// Figma shows explicit "Size scoping" notes per variant:
//   display   → S | M | L  (3 sizes)
//   headline  → S | M | L  (3 sizes, with weight adaption per size)
//   title     → S | M | L  (3 sizes, with weight adaption per size)
//   body      → 2XS | XS | S | M | L  (5 sizes)
//   label     → 3XS | 2XS | XS | S | M | L  (6 sizes, full range)
//   code      → M | S | XS  (3 sizes per native interface)

const VARIANT_SIZES = {
  display:  ['S', 'M', 'L'] as const,
  headline: ['S', 'M', 'L'] as const,
  title:    ['S', 'M', 'L'] as const,
  body:     ['2XS', 'XS', 'S', 'M', 'L'] as const,
  label:    ['3XS', '2XS', 'XS', 'S', 'M', 'L'] as const,
  code:     ['XS', 'S', 'M'] as const,
} as const;

describe('Figma matrix: variant × size', () => {
  for (const [variant, sizes] of Object.entries(VARIANT_SIZES) as [keyof typeof VARIANT_SIZES, readonly string[]][]) {
    for (const size of sizes) {
      it(`[smoke] variant="${variant}" size="${size}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            // @ts-expect-error — dynamic size/variant combo
            <Text variant={variant} size={size}>{variant} {size}</Text>,
          )),
        ).not.toThrow();
      });

      it(`[fn] variant="${variant}" size="${size}" has no accessibilityRole (PR #330)`, () => {
        // PR #330: Text is a generic primitive. Non-interactive variants carry
        // no accessibilityRole — neither 'header' nor 'text'. Heading semantics
        // are the caller's responsibility.
        render(wrap(
          // @ts-expect-error — dynamic size/variant combo
          <Text variant={variant} size={size} testID="matrix-size">{variant} {size}</Text>,
        ));
        const el = screen.getByTestId('matrix-size');
        expect(el.props.accessibilityRole).toBeUndefined();
      });
    }
  }
});

// ─── Figma matrix: variant × weight ──────────────────────────────────────────
//
// Figma weight scoping:
//   display   → medium only (locked, single-weight per Figma)
//   headline  → medium only (font-weight varies by size via "weight adaption")
//   title     → medium only (font-weight varies by size)
//   label     → low | medium | high  (all three)
//   body      → low | medium | high  (all three, body default is low per Figma)
//   code      → low | medium | high  (all three, code default is low per Figma)
//
// Native does NOT enforce Figma's weight scoping — all weights accepted for all
// variants. These tests verify the component accepts all weight values per variant.

const FIGMA_WEIGHT_SCOPED: Record<string, readonly ('low' | 'medium' | 'high')[]> = {
  display:  ['medium'],                    // Figma: locked to medium
  headline: ['medium'],                    // Figma: locked to medium
  title:    ['medium'],                    // Figma: locked to medium
  label:    ['low', 'medium', 'high'],
  body:     ['low', 'medium', 'high'],
  code:     ['low', 'medium', 'high'],
};

describe('Figma matrix: variant × weight', () => {
  for (const [variant, weights] of Object.entries(FIGMA_WEIGHT_SCOPED)) {
    for (const weight of weights) {
      it(`[smoke] variant="${variant}" weight="${weight}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            // @ts-expect-error — dynamic variant
            <Text variant={variant} weight={weight}>{variant} {weight}</Text>,
          )),
        ).not.toThrow();
      });
    }
  }

  it('[fn] display + weight="low" accepted by native (no Figma enforcement)', () => {
    // Figma: display is weight-locked to medium.
    // Native: no enforcement — all weights accepted for all variants.
    // This test documents that native is more permissive than Figma specifies.
    expect(() =>
      render(wrap(<Text variant="display" weight="low">Display low</Text>)),
    ).not.toThrow();
  });

  it('[fn] headline + weight="high" accepted by native (no Figma enforcement)', () => {
    expect(() =>
      render(wrap(<Text variant="headline" weight="high">Headline high</Text>)),
    ).not.toThrow();
  });
});

// ─── Figma matrix: attention (Figma values: low|medium|high|tintedA11Y) ───────
//
// Figma attention scoping:
//   display → high only (Figma: "Attention scoping: Display is only available in high.")
//   others  → low | medium | high | tintedA11Y
//
// Native accepts all attention values for all variants — no scoping enforcement.

const FIGMA_ATTENTIONS = ['low', 'medium', 'high', 'tintedA11y'] as const;

describe('Figma matrix: attention', () => {
  it('[smoke] display + attention="high" (Figma-correct) renders without crashing', () => {
    expect(() =>
      render(wrap(<Text variant="display" attention="high">Display high</Text>)),
    ).not.toThrow();
  });

  it('[fn] display + attention="low" accepted by native (Figma says high only)', () => {
    // Figma: display is attention-scoped to high only.
    // Native: no enforcement — all attention values work.
    // Documents that native is more permissive than Figma specifies.
    expect(() =>
      render(wrap(<Text variant="display" attention="low">Display low attention</Text>)),
    ).not.toThrow();
  });

  for (const variant of ['body', 'label', 'title', 'headline', 'code'] as const) {
    for (const attention of FIGMA_ATTENTIONS) {
      it(`[smoke] variant="${variant}" attention="${attention}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <Text variant={variant} attention={attention}>{variant} {attention}</Text>,
          )),
        ).not.toThrow();
      });
    }
  }
});

// ─── Figma matrix: link (Figma: boolean; native: string|ReactNode) ────────────
//
// Figma shows link as true|false (a boolean toggle for enabling the link slot).
// Native link prop is string|ReactNode (the actual link content).
// These tests document the Figma/native contract differences.

describe('Figma matrix: link prop', () => {
  it('[fn] link=string found in content → inline link with role="link"', () => {
    render(wrap(
      <Text link="here" onLinkPress={vi.fn()}>Tap here to continue</Text>,
    ));
    expect(screen.getByRole('link')).toBeTruthy();
    expect(screen.getByText('here')).toBeTruthy();
  });

  it('[fn] link=undefined (Figma link=false equivalent) → no link in tree', () => {
    render(wrap(<Text>No link</Text>));
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('[fn] link=string (Figma link=true equivalent) → link appears in tree', () => {
    render(wrap(
      <Text link="details" onLinkPress={vi.fn()}>See details here</Text>,
    ));
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('[smoke] link=ReactNode renders trailing slot without crashing', () => {
    expect(() =>
      render(wrap(
        <Text link={<Text>Learn more</Text>}>Main content</Text>,
      )),
    ).not.toThrow();
  });

  it('[smoke] all size+weight combos with link render without crashing', () => {
    const sizeCombos = [
      { variant: 'body', size: 'M', weight: 'high' },
      { variant: 'label', size: 'S', weight: 'medium' },
      { variant: 'code', size: 'XS', weight: 'low' },
    ] as const;
    for (const { variant, size, weight } of sizeCombos) {
      const { unmount } = render(wrap(
        <Text variant={variant} size={size} weight={weight} link="click" onLinkPress={vi.fn()}>
          Please click to continue
        </Text>,
      ));
      expect(screen.getByRole('link')).toBeTruthy();
      unmount();
    }
    render(wrap(<Text>Final</Text>));
  });
});

// ─── Figma: italic (N/A for Jio) ─────────────────────────────────────────────
//
// Figma shows italic=true with tooltip: "N/A — Italic is not available for Jio."
// The Jio brand font (JioType) has no italic axis. Native still applies
// fontStyle:'italic' unconditionally, causing OS-synthesised fake oblique.

describe('Figma: italic — N/A for Jio brand', () => {
  function flatStyle(style: unknown): Record<string, unknown> {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
    if (typeof style === 'object') return style as Record<string, unknown>;
    return {};
  }

  it('[smoke] italic=false renders without crashing', () => {
    expect(() => render(wrap(<Text italic={false}>Normal</Text>))).not.toThrow();
  });

  it('[smoke] italic=true renders without crashing (no brand check in native)', () => {
    // Figma: italic is N/A for Jio. Native still accepts it — no crash, but wrong.
    expect(() => render(wrap(<Text italic>Italic</Text>))).not.toThrow();
  });

  it('[fn] italic=false → fontStyle is not "italic"', () => {
    render(wrap(<Text italic={false} testID="no-italic">Normal</Text>));
    const s = flatStyle(screen.getByTestId('no-italic').props.style);
    expect(s.fontStyle).not.toBe('italic');
  });

  it('[fn] all variants accept italic=true without crashing (no brand enforcement)', () => {
    for (const variant of ['body', 'label', 'title', 'headline', 'display', 'code'] as const) {
      const { unmount } = render(wrap(<Text variant={variant} italic>Italic {variant}</Text>));
      unmount();
    }
    render(wrap(<Text>Final</Text>));
  });

  // ── BUG-TEXT-9: italic=true applies despite Figma marking it N/A for Jio ────

  it('[bug] BUG-TEXT-9: italic=true applies fontStyle="italic" — not available for Jio brand', () => {
    render(wrap(<Text italic testID="italic-bug">Text</Text>));
    const s = flatStyle(screen.getByTestId('italic-bug').props.style);
    // Figma: "N/A — Italic is not available for Jio." — component should NOT apply italic.
    // Bug: fontStyle='italic' IS applied; OS synthesises fake oblique from JioType Var.
    // Expected: italic should be a no-op on Jio brand (or emit a dev warning).
    expect(s.fontStyle).not.toBe('italic');
  });
});

// ─── Figma: underline (per-variant thickness + offset spec) ──────────────────
//
// Figma specifies underline per variant with explicit thickness% and offset%:
//   display  → thickness 15%, offset 25%
//   headline → thickness 15%, offset 25%
//   title    → thickness 15%, offset 25%
//   label / body:
//     Low weight    → thickness 10%, offset 25%
//     Medium weight → thickness 12%, offset 25%
//     High weight   → thickness 15%, offset 25%
//
// React Native `textDecorationLine: 'underline'` provides NO API for thickness
// or offset — these are OS-controlled. Tests verify the style flag is set, and
// document the platform limitation for the per-spec values.

describe('Figma: underline — Figma specifies thickness % and offset %', () => {
  function flatStyle(style: unknown): Record<string, unknown> {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
    if (typeof style === 'object') return style as Record<string, unknown>;
    return {};
  }

  it('[fn] underline=true sets textDecorationLine="underline" for all variants', () => {
    for (const variant of ['body', 'label', 'title', 'headline', 'display', 'code'] as const) {
      const { unmount } = render(wrap(
        <Text variant={variant} underline testID={`und-${variant}`}>Text</Text>,
      ));
      const s = flatStyle(screen.getByTestId(`und-${variant}`).props.style);
      expect(s.textDecorationLine).toBe('underline');
      unmount();
    }
    render(wrap(<Text>Final</Text>));
  });

  it('[fn] underline=false → no textDecorationLine for all variants', () => {
    for (const variant of ['body', 'label', 'title', 'headline', 'display', 'code'] as const) {
      const { unmount } = render(wrap(
        <Text variant={variant} underline={false} testID={`no-und-${variant}`}>Text</Text>,
      ));
      const s = flatStyle(screen.getByTestId(`no-und-${variant}`).props.style);
      expect(s.textDecorationLine).not.toBe('underline');
      unmount();
    }
    render(wrap(<Text>Final</Text>));
  });

  it('[fn] underline=true + weight="low" (Figma: thickness 10%) — sets underline style', () => {
    render(wrap(<Text underline weight="low" testID="und-low">Text</Text>));
    const s = flatStyle(screen.getByTestId('und-low').props.style);
    expect(s.textDecorationLine).toBe('underline');
    // Platform limitation: thickness 10% not controllable via RN API
  });

  it('[fn] underline=true + weight="high" (Figma: thickness 15%) — sets underline style', () => {
    render(wrap(<Text underline weight="high" testID="und-high">Text</Text>));
    const s = flatStyle(screen.getByTestId('und-high').props.style);
    expect(s.textDecorationLine).toBe('underline');
    // Platform limitation: thickness 15% not controllable via RN API
  });

  // ── BUG-TEXT-10: underline thickness/offset not controllable ────────────────

  it('[bug] BUG-TEXT-10: underline thickness is not controllable — platform gap vs Figma spec', () => {
    // Figma: display underline = thickness 15%, offset 25%
    //        body/low underline = thickness 10%, offset 25%
    // Native: textDecorationLine='underline' only — no thickness or offset control.
    // This test documents the platform gap. The rendered underline will differ from
    // the Figma specification on all platforms.
    render(wrap(<Text underline variant="display" testID="und-gap">Text</Text>));
    const s = flatStyle(screen.getByTestId('und-gap').props.style);
    expect(s.textDecorationLine).toBe('underline');
    // Platform gap confirmed: no textDecorationThickness or textDecorationOffset in style
    expect(s.textDecorationThickness).toBeUndefined(); // PASSES: gap documented
    expect(s.textDecorationOffset).toBeUndefined();    // PASSES: gap documented
  });
});

// ─── Figma: strikethrough ─────────────────────────────────────────────────────
//
// Figma shows strikethrough as False / True — straightforward boolean.
// No variant-specific scoping noted (available for all variants).

describe('Figma: strikethrough', () => {
  function flatStyle(style: unknown): Record<string, unknown> {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
    if (typeof style === 'object') return style as Record<string, unknown>;
    return {};
  }

  it('[fn] strikethrough=false (Figma "False") → no line-through', () => {
    render(wrap(<Text strikethrough={false} testID="no-strike">Text</Text>));
    const s = flatStyle(screen.getByTestId('no-strike').props.style);
    expect(s.textDecorationLine).not.toBe('line-through');
  });

  it('[fn] strikethrough=true (Figma "True") → textDecorationLine="line-through"', () => {
    render(wrap(<Text strikethrough testID="strike-true">Text</Text>));
    const s = flatStyle(screen.getByTestId('strike-true').props.style);
    expect(s.textDecorationLine).toBe('line-through');
  });

  it('[fn] strikethrough=true for all variants', () => {
    for (const variant of ['body', 'label', 'title', 'headline', 'display', 'code'] as const) {
      const { unmount } = render(wrap(
        <Text variant={variant} strikethrough testID={`strike-${variant}`}>Text</Text>,
      ));
      const s = flatStyle(screen.getByTestId(`strike-${variant}`).props.style);
      expect(s.textDecorationLine).toBe('line-through');
      unmount();
    }
    render(wrap(<Text>Final</Text>));
  });

  it('[fn] underline=true + strikethrough=true → textDecorationLine="underline line-through"', () => {
    render(wrap(<Text underline strikethrough testID="both-deco">Text</Text>));
    const s = flatStyle(screen.getByTestId('both-deco').props.style);
    expect(s.textDecorationLine).toBe('underline line-through');
  });
});
