/**
 * vitest.setup.ts — React Native test environment setup
 *
 * Mocks the React Native modules that require a native runtime so tests
 * can run in a Node (non-jsdom) environment without bridging.
 */

import { vi } from 'vitest';

// ─── React Native core mock ──────────────────────────────────────────────────
// Provide minimal implementations of the RN APIs our components use.

vi.mock('react-native', () => {
  const mockStyle = (s: unknown) => s;

  return {
    StyleSheet: {
      create: (s: Record<string, unknown>) => s,
      flatten: mockStyle,
    },
    View: 'View',
    Text: 'Text',
    Pressable: 'Pressable',
    ScrollView: 'ScrollView',
    // useColorScheme and other hooks
    useColorScheme: vi.fn(() => 'light'),
    Platform: { OS: 'ios', select: (o: Record<string, unknown>) => o.ios ?? o.default },
  };
});

// ─── @oneui/tokens mock ──────────────────────────────────────────────────────
// `tokens.shape` comes from the REAL package via `importActual`. Hand-copying it
// is what produced the drifted table this migration exists to kill: the stub in
// Carousel.test.ts had `L: 20px` where the f1 step is 18px, and passed green for
// as long as nobody read it. A literal copy here would be the same bug, one file
// over — if `dimension.f1` moves, every styles test must move with it.
//
// TODO: `tokens.spacing` below is still a fake t-shirt table — those keys do not
// exist in the real package, so spacing reads resolve to `undefined` under test.
// Deleting this mock entirely is the right fix (@oneui/tokens is pure constants
// with no react-native imports), but it changes which Carousel tests fail — that
// file already has 4 failures on `dev` and one of them is a real Spacing-2-5 vs
// Spacing-3-5 bug the mock is hiding. Out of scope for the shape rename.
vi.mock('@oneui/tokens', async (importActual) => {
  const actual = await importActual<typeof import('@oneui/tokens')>();
  return {
    tokens: {
      ...actual.tokens,
      spacing: {
        '2xs': 4,
        xs: 6,
        s: 8,
        m: 12,
        l: 16,
        xl: 20,
      },
    },
  };
});
