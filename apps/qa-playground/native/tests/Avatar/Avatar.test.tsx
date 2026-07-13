import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect } from 'vitest';
import { Avatar } from '@ui-native/components/Avatar/Avatar.native';
import { getAvatarContainerSide } from '@ui-native/components/Avatar/avatarLayout';
import { defaultNativeTheme } from '@ui-native/theme';
import { wrap } from '../../utils/renderWithTheme';
import { DUMMY_AVATAR_URI } from '../__fixtures__/dummyAvatarUri';

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Avatar — smoke', () => {
  it('[smoke] renders text content variant without crashing', () => {
    expect(() => render(wrap(<Avatar content="text" alt="John Doe" size="m" />))).not.toThrow();
  });

  it('[smoke] renders image variant without crashing', () => {
    expect(() =>
      render(wrap(<Avatar content="image" src={DUMMY_AVATAR_URI} alt="Jane" size="m" />)),
    ).not.toThrow();
  });

  it('[smoke] renders icon variant without crashing', () => {
    expect(() => render(wrap(<Avatar content="icon" alt="User" size="m" />))).not.toThrow();
  });

  it('[smoke] renders all canonical sizes without crashing', () => {
    // Do NOT unmount between iterations — afterEach captures the last rendered tree.
    // Previously this test unmounted inside the loop, leaving an empty screen for
    // the tree capture. Now all 7 sizes are rendered and the last stays mounted.
    const sizes = ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'] as const;
    for (const size of sizes) {
      expect(() => render(wrap(<Avatar content="text" alt="JD" size={size} />))).not.toThrow();
    }
  });

  it('[smoke] renders all three content types at every size without crashing', () => {
    const sizes = ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'] as const;
    const contents = ['text', 'icon', 'image'] as const;
    for (const size of sizes) {
      for (const content of contents) {
        expect(() =>
          render(wrap(<Avatar content={content} alt="Test" size={size} src={DUMMY_AVATAR_URI} />)),
        ).not.toThrow();
      }
    }
  });
});

// ─── Functional — Initials Extraction ─────────────────────────────────────────
//
// getInitials() in interface.ts: split(' ') → map first char → filter(Boolean)
// → slice(0, 2) → join → toUpperCase.
// Tests below catch regressions in each step.

describe('Avatar — initials extraction', () => {
  it('[fn] two-word alt shows both initials in order', () => {
    render(wrap(<Avatar content="text" alt="John Doe" size="xl" />));
    expect(screen.getByText('JD')).toBeTruthy();
  });

  it('[fn] single-word alt shows exactly one initial — not two', () => {
    render(wrap(<Avatar content="text" alt="Madonna" size="xl" />));
    expect(screen.getByText('M')).toBeTruthy();
    // Bug: producing 'MA' if slice(0,2) reads two chars instead of two words
  });

  it('[fn] three-word alt shows FIRST TWO initials only, not all three', () => {
    render(wrap(<Avatar content="text" alt="John Paul Jones" size="xl" />));
    expect(screen.getByText('JP')).toBeTruthy();
    // Bug: if slice(0,2) is removed → 'JPJ' is rendered (too long, overlaps)
  });

  it('[fn] initials are uppercase even when alt is all-lowercase', () => {
    render(wrap(<Avatar content="text" alt="john doe" size="xl" />));
    expect(screen.getByText('JD')).toBeTruthy();
    // Bug: missing toUpperCase() → renders 'jd'
  });

  it('[fn] empty alt does not crash and shows no initials text', () => {
    expect(() => render(wrap(<Avatar content="text" alt="" size="m" />))).not.toThrow();
    // getInitials('') returns '' → nothing rendered in the Text node
    // component still renders with role=image / label='avatar' fallback (see a11y tests)
  });
});

// ─── Functional — Text fallback at small sizes ─────────────────────────────────
//
// TEXT_FALLBACK_SIZES = new Set(['2xs', 'xs'])
// At these two sizes text content falls back to icon — initials are unreadably small.

describe('Avatar — text-to-icon fallback at small sizes', () => {
  it('[fn] text variant at 2xs does NOT render initials — falls back to icon', () => {
    render(wrap(<Avatar content="text" alt="John Doe" size="2xs" />));
    expect(screen.queryByText('JD')).toBeNull();
    // Bug: TEXT_FALLBACK_SIZES check removed → unreadable 'JD' rendered at 8px
  });

  it('[fn] text variant at xs does NOT render initials — falls back to icon', () => {
    render(wrap(<Avatar content="text" alt="John Doe" size="xs" />));
    expect(screen.queryByText('JD')).toBeNull();
    // Bug: xs accidentally removed from TEXT_FALLBACK_SIZES
  });

  it('[fn] text variant at s DOES render initials', () => {
    render(wrap(<Avatar content="text" alt="John Doe" size="s" />));
    expect(screen.getByText('JD')).toBeTruthy();
    // Bug: s incorrectly added to TEXT_FALLBACK_SIZES → initials never shown at s
  });

  it('[fn] text variant at xl renders initials', () => {
    render(wrap(<Avatar content="text" alt="John Doe" size="xl" />));
    expect(screen.getByText('JD')).toBeTruthy();
  });
});

// ─── Functional — Attention/Emphasis backgrounds ───────────────────────────────
//
// paintFor() maps attention → bg color:
//   high   → role.surfaces.bold   (filled)
//   medium → role.surfaces.subtle (tinted)
//   low    → 'transparent'        (ghost — no background at all)

describe('Avatar — attention backgrounds', () => {
  it('[fn] high attention renders non-transparent background', () => {
    render(wrap(<Avatar content="text" alt="JD" size="m" attention="high" />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.backgroundColor).toBeTruthy();
    expect(style.backgroundColor).not.toBe('transparent');
    // Bug: high attention uses 'transparent' → invisible avatar on white bg
  });

  it('[fn] medium attention renders non-transparent background', () => {
    render(wrap(<Avatar content="text" alt="JD" size="m" attention="medium" />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.backgroundColor).toBeTruthy();
    expect(style.backgroundColor).not.toBe('transparent');
    // Bug: medium mapped to wrong enum value → transparent or wrong colour
  });

  it('[fn] low attention renders transparent background (ghost style)', () => {
    render(wrap(<Avatar content="text" alt="JD" size="m" attention="low" />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.backgroundColor).toBe('transparent');
    // Bug: low attention gets a filled background → looks like medium/high
  });

  it('[fn] high and medium attention backgrounds are visually distinct colours', () => {
    const { rerender } = render(wrap(<Avatar content="text" alt="JD" size="m" attention="high" />));
    const highBg = StyleSheet.flatten(screen.getByRole('image').props.style).backgroundColor;

    rerender(wrap(<Avatar content="text" alt="JD" size="m" attention="medium" />));
    const medBg = StyleSheet.flatten(screen.getByRole('image').props.style).backgroundColor;

    expect(highBg).not.toBe(medBg);
    // Bug: both attention levels resolve to the same surface token
  });

  it('[fn] icon variant — high and medium attention produce different icon fill colours', () => {
    // paintFor() returns a different iconColor per attention level.
    // The Svg fill prop reflects this colour directly.
    const { rerender } = render(wrap(<Avatar content="icon" alt="High" size="m" attention="high" />));
    const highSvg  = screen.UNSAFE_getByType('Svg' as unknown as React.ComponentType);
    const highPath = highSvg.findAllByType('Path' as unknown as React.ComponentType)[0];
    const highFill = highPath?.props.fill as string;

    rerender(wrap(<Avatar content="icon" alt="Medium" size="m" attention="medium" />));
    const medSvg  = screen.UNSAFE_getByType('Svg' as unknown as React.ComponentType);
    const medPath = medSvg.findAllByType('Path' as unknown as React.ComponentType)[0];
    const medFill = medPath?.props.fill as string;

    expect(highFill).toBeTruthy();
    expect(medFill).toBeTruthy();
    expect(highFill).not.toBe(medFill);
    // Bug: paintFor() returns the same iconColor for high and medium →
    //      icon looks identical at both attention levels
  });

  it('[fn] icon variant — low attention container is transparent', () => {
    render(wrap(<Avatar content="icon" alt="Low" size="m" attention="low" />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.backgroundColor).toBe('transparent');
    // Bug: low attention fills the icon container → ghost style not applied
  });
});

// ─── Functional — Image behaviour ─────────────────────────────────────────────

describe('Avatar — image behaviour', () => {
  it('[fn] image variant has transparent background while src is valid', () => {
    render(wrap(<Avatar content="image" src={DUMMY_AVATAR_URI} alt="Jane" size="m" />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.backgroundColor).toBe('transparent');
    // Bug: coloured circle bleeds through the avatar photo
  });

  it('[fn] image element is a11y-hidden — prevents screen reader double-announcement', () => {
    render(wrap(<Avatar content="image" src={DUMMY_AVATAR_URI} alt="Jane" size="m" />));
    // Only the outer View (role=image) should be visible — not the inner <Image>
    expect(screen.getAllByRole('image', { name: 'Jane' })).toHaveLength(1);
    // Bug: Image missing accessibilityElementsHidden → VoiceOver says "Jane Jane"
  });

  it('[fn] image error: image element is removed from tree', () => {
    render(wrap(<Avatar content="image" src={DUMMY_AVATAR_URI} alt="Jane" size="m" />));
    const imgEl = screen.getByTestId('avatar-native-image', { includeHiddenElements: true });
    fireEvent(imgEl, 'error');
    expect(screen.queryByTestId('avatar-native-image')).toBeNull();
    // Bug: imageError state not set → broken image remains in tree
  });

  it('[fn] image error: container keeps image role and label after fallback', () => {
    render(wrap(<Avatar content="image" src={DUMMY_AVATAR_URI} alt="Jane Smith" size="xl" />));
    const imgEl = screen.getByTestId('avatar-native-image', { includeHiddenElements: true });
    fireEvent(imgEl, 'error');
    expect(screen.getByRole('image', { name: 'Jane Smith' })).toBeTruthy();
    // Bug: error handler clears/replaces the accessible container → label lost
  });

  it('[fn] image error: background switches from transparent to paint colour', () => {
    render(wrap(<Avatar content="image" src={DUMMY_AVATAR_URI} alt="Jane" size="m" attention="high" />));
    const imgEl = screen.getByTestId('avatar-native-image', { includeHiddenElements: true });

    // Before error: image fills the circle, bg is transparent
    expect(
      StyleSheet.flatten(screen.getByRole('image').props.style).backgroundColor,
    ).toBe('transparent');

    fireEvent(imgEl, 'error');

    // After error: fallback icon/text rendered, bg should show the attention colour
    const afterBg = StyleSheet.flatten(screen.getByRole('image').props.style).backgroundColor;
    expect(afterBg).not.toBe('transparent');
    // Bug: bgColor still 'transparent' after error → fallback icon/text invisible
  });
});

// ─── Functional — Icon variant ────────────────────────────────────────────────

describe('Avatar — icon variant', () => {
  it('[fn] icon variant container has image role', () => {
    render(wrap(<Avatar content="icon" alt="User" size="m" />));
    expect(screen.getByRole('image')).toBeTruthy();
    // Bug: icon variant uses wrong/no role
  });

  it('[fn] icon SVG is a11y-hidden — only one image element announced', () => {
    render(wrap(<Avatar content="icon" alt="User" size="m" />));
    // The Svg must have accessibilityElementsHidden so the raw path data is not read
    expect(screen.getAllByRole('image', { name: 'User' })).toHaveLength(1);
    // Bug: Svg missing accessibilityElementsHidden → TalkBack reads "path M16 6a4 4…"
  });
});

// ─── Functional — Disabled ────────────────────────────────────────────────────

describe('Avatar — disabled state', () => {
  it('[fn] disabled sets opacity to exactly 0.5', () => {
    render(wrap(<Avatar content="text" alt="J" size="m" disabled />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.opacity).toBe(0.5);
    // Bug: DISABLED_OPACITY constant changed (e.g. to 0.38) without QA catching it
  });

  it('[fn] non-disabled has full opacity of 1', () => {
    render(wrap(<Avatar content="text" alt="J" size="m" />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.opacity).toBe(1);
    // Bug: opacity accidentally set < 1 even when enabled
  });

  it('[fn] disabled icon variant also has opacity 0.5', () => {
    render(wrap(<Avatar content="icon" alt="User" size="m" disabled />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.opacity).toBe(0.5);
    // Bug: disabled prop only applied to text variant, not icon
  });
});

// ─── Functional — Size dimensions ────────────────────────────────────────────

describe('Avatar — size dimensions', () => {
  it('[fn] container side matches spacing token for each canonical size', () => {
    const theme = defaultNativeTheme();
    const cases = [
      ['2xs', theme.spacing['2']],
      ['xs',  theme.spacing['3']],
      ['s',   theme.spacing['4']],
      ['m',   theme.spacing['5']],
      ['l',   theme.spacing['6']],
      ['xl',  theme.spacing['8']],
      ['2xl', theme.spacing['10']],
    ] as const;
    // Unmount between iterations so getByRole('image') finds only the current size.
    // Skip unmount on the last iteration so afterEach captures its tree.
    for (let i = 0; i < cases.length; i++) {
      const [size, expected] = cases[i]!;
      const { unmount } = render(wrap(<Avatar content="text" alt="JD" size={size} />));
      const flat = StyleSheet.flatten(screen.getByRole('image').props.style);
      expect(flat.width,  `${size} width`).toBe(expected);
      expect(flat.height, `${size} height`).toBe(expected);
      if (i < cases.length - 1) unmount();
    }
  });

  it('[fn] sizes are strictly increasing from 2xs to 2xl', () => {
    // Pure function test — no render needed for the assertion itself.
    // Render a representative Avatar afterwards so afterEach captures a tree.
    const theme = defaultNativeTheme();
    const sizes = ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'] as const;
    const dims = sizes.map((s) => getAvatarContainerSide(theme.spacing, s));
    for (let i = 1; i < dims.length; i++) {
      expect(dims[i], `${sizes[i]} > ${sizes[i - 1]}`).toBeGreaterThan(dims[i - 1]);
      // Bug: two adjacent sizes share the same token → same pixel size
    }
    render(wrap(<Avatar content="text" alt="JD" size="xl" />));
  });

  it('[fn] width and height are equal (square container for circular clipping)', () => {
    render(wrap(<Avatar content="text" alt="JD" size="m" />));
    const flat = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(flat.width).toBe(flat.height);
    // Bug: non-square container produces an oval avatar instead of circle
  });
});

// ─── Functional — Recipe ──────────────────────────────────────────────────────

describe('Avatar — recipe decisions', () => {
  it('[fn] cornerRadius=none overrides border radius to 0 (square avatar)', () => {
    render(wrap(<Avatar content="text" alt="J" size="m" />, { avatar: { cornerRadius: 'none' } }));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.borderRadius).toBe(0);
    // Bug: recipe override not applied → avatar stays circular when square is expected
  });

  it('[fn] default (no recipe) renders with non-zero border radius (pill/circle)', () => {
    render(wrap(<Avatar content="text" alt="J" size="m" />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.borderRadius).toBeGreaterThan(0);
    // Bug: default borderRadius accidentally 0 → square avatar without recipe
  });
});

// ─── Functional — Custom size ─────────────────────────────────────────────────
//
// size='custom' + customSize passes the exact value to width/height.
// customSize uses nullish coalescing (??), so 0 and negative values are NOT
// treated as absent — they pass straight through to layout, producing an
// invisible or invalid avatar.

describe('Avatar — custom size', () => {
  it('[fn] customSize=64 produces a 64px container', () => {
    render(wrap(<Avatar content="text" alt="JD" size="custom" customSize={64} />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    expect(style.width).toBe(64);
    expect(style.height).toBe(64);
  });

  it('[fn] customSize=0 produces an invisible avatar — zero is not nullish so fallback is skipped', () => {
    render(wrap(<Avatar content="text" alt="Zero" size="custom" customSize={0} />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    // `customSize ?? spacing['5']` evaluates to 0 because 0 is not null/undefined.
    // Bug: width and height become 0 → avatar completely invisible in the UI.
    // Fix needs: Math.max(1, customSize) or a positive-number guard before the ?? fallback.
    expect(style.width).toBeGreaterThan(0);
    expect(style.height).toBeGreaterThan(0);
  });

  it('[fn] negative customSize passes through without clamping — produces invalid dimensions', () => {
    render(wrap(<Avatar content="text" alt="Neg" size="custom" customSize={-10} />));
    const style = StyleSheet.flatten(screen.getByRole('image').props.style);
    // Bug: -10 reaches getAvatarContainerSide unchanged → width:-10, height:-10 in RN layout.
    // Fix needs: clamp to Math.max(0, customSize) or validate > 0 at the prop boundary.
    expect(style.width).toBeGreaterThan(0);
    expect(style.height).toBeGreaterThan(0);
  });
});

// ─── Functional — Fallback content edge cases ────────────────────────────────
//
// Three separate fallback paths share a common gap: the component only routes to
// renderTextSlot() when effectiveContent === 'text', so string fallbacks supplied
// to the icon path land inside a bare View — a React Native invariant violation.
//
//   BUG-1 [P1] content='icon' + string fallback  → raw string in View → RN crash
//   BUG-2 [P2] content='image' + no src + string → icon slot, string never shown
//   BUG-6 [P3] content='text' + alt='' + no fallback → blank circle (no icon)

describe('Avatar — fallback content', () => {
  it('[fn] icon content with string fallback renders that text without crashing', () => {
    // renderIconSlot(): custom = icon ?? fallback = undefined ?? "JD" = "JD" (string).
    // The string is placed directly as a child of AvatarIconSlot's View — no <Text> wrapper.
    // In React Native this triggers: "Text strings must be rendered within a <Text> component".
    expect(() =>
      render(wrap(<Avatar content="icon" alt="JD" size="m" fallback="JD" />)),
    ).not.toThrow();
    // After fixing the crash the fallback string must also be visible:
    expect(screen.getByText('JD')).toBeTruthy();
    // Bug: string fallback in renderIconSlot is not wrapped in <Text> → RN invariant crash.
  });

  it('[fn] image content with no src renders string fallback as text — not the default icon', () => {
    // showImage = false (no src) → renderFallback() → effectiveContent is still 'image'
    // → renderIconSlot() is called rather than renderTextSlot().
    // icon ?? fallback = "AB" → AvatarIconSlot receives a raw string → crash (BUG-1 path)
    // OR fallback is silently swallowed and the person icon is shown instead of "AB".
    render(wrap(<Avatar content="image" alt="AB" size="m" fallback="AB" />));
    // Expected: 'AB' is shown as text (like renderTextSlot would display it).
    expect(screen.getByText('AB')).toBeTruthy();
    // Bug: effectiveContent remains 'image' → renderIconSlot() is entered, text fallback lost.
  });

  it('[fn] text content with blank alt and no fallback renders empty Text node — no person icon shown', () => {
    render(wrap(<Avatar content="text" alt="" size="m" />));
    // getInitials('') returns '' → renderTextSlot renders <Text>{''}</Text>.
    // effectiveContent is 'text' at size 'm' (not in TEXT_FALLBACK_SIZES),
    // so renderTextSlot() is called rather than renderIconSlot().
    // No Svg person-icon is rendered — the container shows a blank circle with an empty label.
    // BUG-6: the component should ideally fall back to the person icon when no initials are
    // derivable and no explicit fallback is set, but current implementation renders empty Text.
    expect(
      screen.UNSAFE_queryByType('Svg' as unknown as React.ComponentType),
    ).toBeNull();
    // Confirm the empty text node exists in the tree
    expect(screen.getByText('')).toBeTruthy();
  });
});

// ─── Functional — testID forwarding ──────────────────────────────────────────

describe('Avatar — testID forwarding', () => {
  it('[fn] testID prop is forwarded to root View', () => {
    // data-testid was removed from AvatarProps on 2026-05-27; testID is the correct native prop.
    // Avatar.native.tsx forwards testID to the root View and derives sub-element IDs:
    //   <testID>-image, <testID>-icon, <testID>-initials, <testID>-fallback
    render(wrap(<Avatar content="text" alt="TD" size="m" testID="avatar-root" />));
    expect(screen.getByTestId('avatar-root')).toBeTruthy();
  });

  it('[fn] testID is used to derive sub-element test IDs', () => {
    render(wrap(<Avatar content="text" alt="TD" size="m" testID="av" />));
    expect(screen.getByTestId('av-initials')).toBeTruthy();
  });
});

// ─── Functional — Initials extended edge cases ────────────────────────────────
//
// getInitials() splits on ' ' then filters(Boolean) to discard empty parts,
// which means leading spaces, double spaces, and digit names all resolve
// correctly. These tests guard against regressions if the function is refactored.

describe('Avatar — initials extended edge cases', () => {
  it('[fn] alt with a leading space extracts the correct initial', () => {
    render(wrap(<Avatar content="text" alt=" John" size="xl" />));
    // " John".split(' ') → ['', 'John'] → filter(Boolean) removes '' → ['J'] → 'J'
    expect(screen.getByText('J')).toBeTruthy();
  });

  it('[fn] alt with double internal space still produces two-letter initials', () => {
    render(wrap(<Avatar content="text" alt="John  Doe" size="xl" />));
    // ['John', '', 'Doe'] → map(charAt(0)) → ['J','','D'] → filter → ['J','D'] → 'JD'
    expect(screen.getByText('JD')).toBeTruthy();
  });

  it('[fn] numeric alt produces digit initials — digits are truthy so filter keeps them', () => {
    render(wrap(<Avatar content="text" alt="007 Agent" size="xl" />));
    // '007'.charAt(0) = '0' is truthy → kept by filter → result is '0A'
    expect(screen.getByText('0A')).toBeTruthy();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Avatar — a11y', () => {
  it('[a11y] text variant container has image role', () => {
    render(wrap(<Avatar content="text" alt="John Doe" size="m" />));
    expect(screen.getByRole('image')).toBeTruthy();
  });

  it('[a11y] icon variant container has image role', () => {
    render(wrap(<Avatar content="icon" alt="User" size="m" />));
    expect(screen.getByRole('image')).toBeTruthy();
    // Bug: icon variant missing role → screen reader cannot identify element type
  });

  it('[a11y] image variant container has image role', () => {
    render(wrap(<Avatar content="image" src={DUMMY_AVATAR_URI} alt="Photo" size="m" />));
    expect(screen.getByRole('image')).toBeTruthy();
    // Bug: image variant missing role
  });

  it('[a11y] alt prop maps to accessibilityLabel for all three content types', () => {
    // Each alt is unique — queries won't clash across stacked renders.
    // Last render stays mounted so afterEach captures its tree.
    const cases = [
      { content: 'text',  alt: 'Text User' },
      { content: 'icon',  alt: 'Icon User' },
      { content: 'image', alt: 'Image User' },
    ] as const;
    for (const { content, alt } of cases) {
      render(wrap(<Avatar content={content} alt={alt} size="m" src={DUMMY_AVATAR_URI} />));
      expect(screen.getByRole('image', { name: alt })).toBeTruthy();
    }
    // Bug: icon or image variant doesn't forward alt to accessibilityLabel
  });

  it('[a11y] empty alt uses "avatar" fallback label — never silent', () => {
    render(wrap(<Avatar content="text" alt="" size="m" />));
    expect(screen.getByRole('image', { name: 'avatar' })).toBeTruthy();
    // Bug: empty string passed through → VoiceOver announces nothing
  });

  it('[a11y] disabled=true sets accessibilityState.disabled to true', () => {
    render(wrap(<Avatar content="text" alt="J" size="m" disabled />));
    expect(screen.getByRole('image').props.accessibilityState?.disabled).toBe(true);
  });

  it('[a11y] non-disabled has accessibilityState.disabled false', () => {
    render(wrap(<Avatar content="text" alt="J" size="m" />));
    expect(screen.getByRole('image').props.accessibilityState?.disabled).toBe(false);
    // Bug: disabled defaults to true → all avatars announced as disabled
  });

  it('[a11y] disabled icon variant sets accessibilityState.disabled', () => {
    render(wrap(<Avatar content="icon" alt="User" size="m" disabled />));
    expect(screen.getByRole('image').props.accessibilityState?.disabled).toBe(true);
    // Bug: disabled prop not forwarded for icon content type
  });
});
