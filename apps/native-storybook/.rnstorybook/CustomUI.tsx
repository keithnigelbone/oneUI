/**
 * CustomUI.tsx — a bespoke, OneUI-branded on-device Storybook shell.
 *
 * Replaces the default minimal Storybook navigator (passed as
 * `CustomUIComponent` to `getStorybookUI`) with a professional design-system
 * browser: branded app bar, a searchable component drawer grouped by category,
 * a clean breadcrumb, and prev/next story stepping.
 *
 * Contract (from `@storybook/react-native-ui-common`'s `SBUI`):
 *   story      — current story context (id / title / name)
 *   storyHash  — full index hash of every story
 *   setStory   — select a story by id
 *   children   — the rendered story canvas (already wrapped by preview.tsx)
 */
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SBUI } from '@storybook/react-native-ui-common';

const INDIGO = '#4B1FD6';
const INK = '#16181D';
const SUBTLE = '#6B7280';
const LINE = '#E6E8EC';
const BG = '#FFFFFF';
const RAIL = '#F7F8FA';

interface StoryLeaf {
  id: string;
  name: string;
  title: string; // e.g. "Components/Forms/InputField"
}
interface ComponentGroup {
  title: string;
  component: string; // last segment
  category: string; // middle segment(s)
  stories: StoryLeaf[];
}

/** Flatten the index hash into ordered component groups by category. */
function buildGroups(storyHash: Record<string, any>): {
  groups: ComponentGroup[];
  flat: StoryLeaf[];
} {
  const leaves: StoryLeaf[] = Object.values(storyHash || {})
    .filter((e: any) => e?.type === 'story' && typeof e?.title === 'string')
    .map((e: any) => ({ id: e.id, name: e.name ?? e.id, title: e.title }));

  const byTitle = new Map<string, StoryLeaf[]>();
  for (const leaf of leaves) {
    if (!byTitle.has(leaf.title)) byTitle.set(leaf.title, []);
    byTitle.get(leaf.title)!.push(leaf);
  }

  const groups: ComponentGroup[] = [];
  for (const [title, stories] of byTitle) {
    const segs = title.split('/');
    const component = segs[segs.length - 1];
    const category = segs.length >= 3 ? segs[segs.length - 2] : segs[0] ?? 'Components';
    groups.push({ title, component, category, stories });
  }
  groups.sort((a, b) =>
    a.category === b.category
      ? a.component.localeCompare(b.component)
      : a.category.localeCompare(b.category),
  );
  return { groups, flat: leaves };
}

type Row =
  | { kind: 'category'; key: string; label: string }
  | { kind: 'component'; key: string; label: string; group: ComponentGroup }
  | { kind: 'story'; key: string; leaf: StoryLeaf };

const CustomUI: SBUI = ({ story, storyHash, setStory, children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [openComponents, setOpenComponents] = useState<Record<string, boolean>>({});
  const insets = useSafeAreaInsets();

  const { groups, flat } = useMemo(
    () => buildGroups(storyHash as Record<string, any>),
    [storyHash],
  );

  const currentId: string | undefined = (story as any)?.id;
  const currentTitle: string = (story as any)?.title ?? 'OneUI';
  const currentName: string = (story as any)?.name ?? '';
  const currentComponent = currentTitle.split('/').pop() ?? 'OneUI';

  // prev / next stepping through the flat story order.
  const idx = flat.findIndex((l) => l.id === currentId);
  const go = (delta: number) => {
    if (flat.length === 0) return;
    const next = (idx + delta + flat.length) % flat.length;
    setStory(flat[next].id);
  };

  // Build the drawer rows (category headers + expandable components + stories),
  // filtered by the search query.
  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    const matches = (g: ComponentGroup) =>
      !q ||
      g.component.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.stories.some((s) => s.name.toLowerCase().includes(q));

    const visible = groups.filter(matches);
    const out: Row[] = [];
    let lastCategory = '';
    for (const g of visible) {
      if (g.category !== lastCategory) {
        out.push({ kind: 'category', key: `cat:${g.category}`, label: g.category });
        lastCategory = g.category;
      }
      out.push({ kind: 'component', key: `cmp:${g.title}`, label: g.component, group: g });
      const expanded = openComponents[g.title] ?? Boolean(q);
      if (expanded) {
        for (const s of g.stories) {
          out.push({ kind: 'story', key: s.id, leaf: s });
        }
      }
    }
    return out;
  }, [groups, query, openComponents]);

  const renderRow = ({ item }: { item: Row }) => {
    if (item.kind === 'category') {
      return <Text style={styles.category}>{item.label.toUpperCase()}</Text>;
    }
    if (item.kind === 'component') {
      const expanded = openComponents[item.group.title] ?? Boolean(query.trim());
      return (
        <Pressable
          style={styles.componentRow}
          onPress={() =>
            setOpenComponents((s) => ({ ...s, [item.group.title]: !expanded }))
          }
        >
          <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
          <Text style={styles.componentText}>{item.label}</Text>
          <Text style={styles.count}>{item.group.stories.length}</Text>
        </Pressable>
      );
    }
    const active = item.leaf.id === currentId;
    return (
      <Pressable
        style={[styles.storyRow, active && styles.storyRowActive]}
        onPress={() => {
          setStory(item.leaf.id);
          setDrawerOpen(false);
        }}
      >
        <Text style={[styles.storyText, active && styles.storyTextActive]}>
          {item.leaf.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={INDIGO} />
      {/* Branded app bar */}
      <View style={[styles.appBar, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <Pressable
          hitSlop={10}
          style={styles.menuBtn}
          onPress={() => setDrawerOpen(true)}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </Pressable>
        <View style={styles.brandWrap}>
          <Text style={styles.brand}>OneUI</Text>
          <Text style={styles.brandSub}>React Native</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable hitSlop={8} style={styles.stepBtn} onPress={() => go(-1)}>
            <Text style={styles.stepText}>‹</Text>
          </Pressable>
          <Pressable hitSlop={8} style={styles.stepBtn} onPress={() => go(1)}>
            <Text style={styles.stepText}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Breadcrumb for the current story */}
      <Pressable style={styles.breadcrumb} onPress={() => setDrawerOpen(true)}>
        <Text style={styles.crumbComponent}>{currentComponent}</Text>
        {currentName ? <Text style={styles.crumbName}>{currentName}</Text> : null}
      </Pressable>

      {/* Story canvas */}
      <View style={styles.canvas}>{children}</View>

      {/* Component drawer */}
      <Modal
        visible={drawerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setDrawerOpen(false)} />
          <SafeAreaView style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Components</Text>
              <Pressable hitSlop={10} onPress={() => setDrawerOpen(false)}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.search}
              placeholder="Search components…"
              placeholderTextColor={SUBTLE}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <FlatList
              data={rows}
              keyExtractor={(r) => r.key}
              renderItem={renderRow}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  appBar: {
    height: 56,
    backgroundColor: INDIGO,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  menuBtn: { width: 28, height: 28, justifyContent: 'center', gap: 4 },
  menuLine: { height: 2, width: 22, backgroundColor: '#FFFFFF', borderRadius: 2 },
  brandWrap: { flex: 1, marginLeft: 12 },
  brand: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  brandSub: { color: '#D7CCFB', fontSize: 11, fontWeight: '600', marginTop: -1 },
  stepper: { flexDirection: 'row', gap: 6 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  breadcrumb: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: LINE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: RAIL,
  },
  crumbComponent: { color: INK, fontSize: 14, fontWeight: '700' },
  crumbName: { color: SUBTLE, fontSize: 13, fontWeight: '500' },
  canvas: { flex: 1, backgroundColor: BG },

  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16,18,24,0.45)' },
  drawer: {
    width: '84%',
    maxWidth: 360,
    backgroundColor: BG,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  drawerTitle: { fontSize: 20, fontWeight: '800', color: INK },
  close: { fontSize: 18, color: SUBTLE, fontWeight: '600' },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 12,
    color: INK,
    fontSize: 14,
    backgroundColor: RAIL,
  },
  listContent: { paddingBottom: 32 },
  category: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: SUBTLE,
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
  },
  chevron: { color: SUBTLE, fontSize: 12, width: 14 },
  componentText: { flex: 1, color: INK, fontSize: 15, fontWeight: '600' },
  count: {
    color: SUBTLE,
    fontSize: 12,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  storyRow: { paddingVertical: 9, paddingLeft: 38, paddingRight: 16 },
  storyRowActive: {
    backgroundColor: '#EEE9FC',
    borderLeftWidth: 3,
    borderLeftColor: INDIGO,
    paddingLeft: 35,
  },
  storyText: { color: '#374151', fontSize: 14 },
  storyTextActive: { color: INDIGO, fontWeight: '700' },
});

export default CustomUI;
