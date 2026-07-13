import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Surface, Text, Icon } from '@oneui/ui-native';
import * as JioNativeIcons from '@oneui/icons-jio-native';
// initJdsJioIcons wires up the async icon loader so <Icon name="add" /> works via
// semantic mappings. @oneui/icons-jio-native auto-registers on import but this call
// also enables JDS alias resolution (IcCare → IcFavorite, etc.)
JioNativeIcons.initJdsJioIcons(JioNativeIcons);

interface DemoScreenProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

export function DemoScreen({ mode, onToggleMode }: DemoScreenProps) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Mode toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity onPress={onToggleMode} style={styles.modeButton} accessibilityRole="button" accessibilityLabel={`Current mode: ${mode}. Tap to toggle.`}>
            <Text variant="label" size="S">Mode: {mode}</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.section}>
          <Text variant="display" size="S">OneUI Native</Text>
          <Text variant="body" size="M" style={styles.subtitle}>
            Your app is running with the{' '}
            <Text variant="body" size="M" weight="high">__BRAND_ID__</Text>
            {' '}brand. Edit{' '}
            <Text variant="body" size="M" weight="high">oneui.brands.json</Text>
            {' '}and run{' '}
            <Text variant="body" size="M" weight="high">npm run prefetch</Text>
            {' '}to switch brands.
          </Text>
        </View>

        {/* Buttons — attention levels */}
        <View style={styles.section}>
          <Text variant="title" size="S" style={styles.sectionLabel}>Buttons</Text>
          <Button attention="high" onPress={() => { }}>High attention</Button>
          <Button attention="medium" onPress={() => { }}>Medium attention</Button>
          <Button attention="low" onPress={() => { }}>Low attention</Button>
        </View>

        {/* Buttons — start / end icon slots */}
        <View style={styles.section}>
          <Text variant="title" size="S" style={styles.sectionLabel}>Buttons with icons</Text>
          <Button
            attention="high"
            start={<Icon icon="add" />}
            onPress={() => { }}
          >
            Start icon
          </Button>
          <Button
            attention="high"
            end={<Icon icon={JioNativeIcons.IcChevronRight} />}
            onPress={() => { }}
          >
            End icon
          </Button>
          <Button
            attention="medium"
            start={<Icon icon={JioNativeIcons.IcSearch} />}
            end={<Icon icon={JioNativeIcons.IcChevronRight} />}
            onPress={() => { }}
          >
            Both slots
          </Button>
        </View>

        {/* Surface context — components adapt automatically when nested inside */}
        <View style={styles.section}>
          <Text variant="title" size="S" style={styles.sectionLabel}>Surface context</Text>
          <Surface mode="bold" style={styles.surface}>
            <Text variant="title" size="S">Bold surface</Text>
            <Text variant="body" size="S">
              Components inside adapt colors automatically — no extra code.
            </Text>
            <Button attention="high" start={<Icon icon={JioNativeIcons.IcAdd} />} onPress={() => { }}>
              Adapts to surface
            </Button>
            <Button attention="medium" start={<Icon icon="add" />} onPress={() => { }}>Tinted on bold</Button>
          </Surface>
          <Surface mode="subtle" style={styles.surface}>
            <Text variant="title" size="S">Subtle surface</Text>
            <Button
              attention="high"
              start={<Icon icon="add" />}
              onPress={() => { }}
            >
              Still readable
            </Button>
          </Surface>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, gap: 32 },
  toggleRow: { alignItems: 'flex-end' },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
  },
  section: { gap: 12 },
  sectionLabel: { marginBottom: 4 },
  subtitle: { opacity: 0.7 },
  surface: { padding: 16, borderRadius: 16, gap: 12 },
});
