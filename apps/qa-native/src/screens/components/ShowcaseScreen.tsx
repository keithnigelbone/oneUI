/**
 * ShowcaseScreen — generic screen that renders an ordered list of named
 * showcase sections. Each section is one exported function from a
 * `@oneui/ui-native/showcase/<Name>` module.
 *
 * Used by every component in componentRegistry that does not have a bespoke
 * hand-written screen (i.e. everything except Button, which has its own full
 * Figma-matrix layout in ButtonScreen.tsx).
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { tokens, typography } from '@oneui/tokens';
import type { ComponentProps } from '../../../App';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ShowcaseSection {
  readonly label: string;
  readonly Component: React.ComponentType;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Returns a screen component pre-loaded with the given sections.
 * Used in showcaseRegistry.ts to build each component's screen without
 * repeating the ScrollView / section chrome boilerplate.
 */
export function makeShowcaseScreen(
  sections: readonly ShowcaseSection[],
): React.ComponentType<ComponentProps> {
  function WrappedShowcaseScreen(props: ComponentProps) {
    return <ShowcaseScreen {...props} sections={sections} />;
  }
  WrappedShowcaseScreen.displayName = 'WrappedShowcaseScreen';
  return WrappedShowcaseScreen;
}

/**
 * Converts a raw showcase module (the result of `import * as Foo from '…'`)
 * into a sorted array of ShowcaseSection entries, stripping the component
 * name prefix and converting CamelCase to "Title Case" for readability.
 *
 * e.g. DividerWithLabel → "With Label"
 *      DividerDefault   → "Default"
 *
 * Only function exports are included (filters out type re-exports and
 * duplicate alias constants like `DividerAttentions = DividerAttentionLevels`).
 */
export function showcaseModuleToSections(
  mod: Record<string, unknown>,
  componentName: string,
): ShowcaseSection[] {
  const seen = new Set<unknown>();
  return Object.entries(mod)
    .filter(([, val]) => {
      if (typeof val !== 'function') return false;
      if (seen.has(val)) return false; // skip re-exported aliases
      seen.add(val);
      return true;
    })
    .map(([exportName, Component]) => {
      const stripped = exportName.startsWith(componentName)
        ? exportName.slice(componentName.length)
        : exportName;
      const label = stripped
        ? stripped.replace(/([A-Z])/g, ' $1').trim()
        : componentName;
      return { label, Component: Component as React.ComponentType };
    });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

interface ShowcaseScreenProps extends ComponentProps {
  readonly sections: readonly ShowcaseSection[];
}

function ShowcaseScreen({
  route,
  sections,
}: ShowcaseScreenProps): React.ReactElement {
  const { name } = route.params;
  const role = useSurfaceTokens('neutral');

  return (
    <ScrollView
      testID={`screen-${name}`}
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {sections.map(({ label, Component }) => (
        <View key={label} style={styles.section}>
          <Text
            style={[styles.sectionLabel, { color: role.content.medium }]}
            numberOfLines={1}
          >
            {label}
          </Text>
          <View
            style={[
              styles.sectionContent,
              { borderColor: role.content.strokeLow },
            ]}
          >
            <Component />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: tokens.spacing['4'],
    gap: tokens.spacing['5'],
    paddingBottom: tokens.spacing['10'],
  },
  section: {
    gap: tokens.spacing['2'],
  },
  sectionLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderWidth: 1,
    borderRadius: tokens.shape.m,
    padding: tokens.spacing['4'],
    overflow: 'hidden',
  },
});
