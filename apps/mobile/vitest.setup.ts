/**
 * vitest.setup.ts — Mobile app test environment setup
 *
 * Provides vitest-compatible mocks for React Native modules and Expo APIs.
 */

import { vi } from 'vitest';

// ─── React Native core ────────────────────────────────────────────────────────
vi.mock('react-native', () => ({
  StyleSheet: {
    create: (s: Record<string, unknown>) => s,
    flatten: (s: unknown) => s,
  },
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  useColorScheme: vi.fn(() => 'light'),
  Platform: {
    OS: 'ios',
    select: (o: Record<string, unknown>) => o.ios ?? o.default,
  },
}));

// ─── @react-native-async-storage/async-storage ──────────────────────────────
vi.mock('@react-native-async-storage/async-storage', () => {
  const store: Map<string, string> = new Map();
  // Use implementations that always return promises, even after mockReset()
  // calls — `mockReset` clears mock state but keeps the implementation
  // when re-supplied via mockImplementation.
  const asyncStorageMock = {
    getItem: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
    clear: vi.fn(() => {
      store.clear();
      return Promise.resolve();
    }),
    __store: store,
  };
  return { default: asyncStorageMock };
});

// ─── expo-font ────────────────────────────────────────────────────────────────
vi.mock('expo-font', () => ({
  loadAsync: vi.fn(async () => undefined),
  isLoaded: vi.fn(() => false),
  isLoading: vi.fn(() => false),
}));

// ─── convex/react ─────────────────────────────────────────────────────────────
vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => undefined),
}));

// ─── @oneui/convex ────────────────────────────────────────────────────────────
vi.mock('@oneui/convex', () => ({
  api: {
    brands: {
      list: 'brands:list',
    },
  },
}));

// ─── @oneui/ui-native ─────────────────────────────────────────────────────────
vi.mock('@oneui/ui-native', () => ({
  useOneUITheme: vi.fn(() => ({
    typography: {
      fontFamilies: { primary: 'System', code: 'monospace' },
    },
  })),
  useOptionalOneUITheme: vi.fn(() => null),
  useSurfaceTokens: vi.fn((role: string) => ({
    surfaces: { bold: '#cc3333', subtle: '#ffeeee' },
    content: { tintedA11y: '#cc0000', high: '#111111' },
    onBoldContent: { high: '#ffffff', tintedA11y: '#ffffff' },
    onSubtleContent: { tintedA11y: '#cc0000' },
    states: { boldPressed: '#aa2222', subtlePressed: '#ffdddd' },
    role,
  })),
  useTypographyTokens: vi.fn((_role: string, _size: string) => ({
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500 as const,
    fontFamily: 'System',
  })),
}));
