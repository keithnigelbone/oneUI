import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  useOptionalOneUITheme,
  type NativeRoleTokens,
  type NativeTypeStyle,
  type OneUINativeTheme,
} from '@oneui/ui-native';

interface Brand {
  _id: string;
  name: string;
  isSystem?: boolean;
}

interface BrandPickerHeaderProps {
  brands: Brand[];
  activeId: string | null;
  onSelect: (id: string) => void;
  darkMode: boolean;
}

interface PillTokens {
  onColor: string;
  inactiveBg: string;
  activeBg: string;
  activeFg: string;
  labelXS: NativeTypeStyle | null;
  labelS: NativeTypeStyle | null;
}

// Loading-state fallback (skeleton, see CLAUDE.md "Known Exceptions").
const FALLBACK_DARK = { on: '#fff', inactive: '#1f1f1f', activeBg: '#fff', activeFg: '#111' };
const FALLBACK_LIGHT = { on: '#111', inactive: '#f1f1f1', activeBg: '#111', activeFg: '#fff' };

function readLabelSize(
  theme: OneUINativeTheme,
  size: '2XL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | '2XS' | '3XS',
  emphasis: 'high' | 'medium' | 'low',
): NativeTypeStyle {
  const labelTree = theme.typography.label;
  const base = labelTree.sizes[size];
  return { ...base, fontWeight: labelTree.weights[emphasis] };
}

export function derivePillTokens(
  theme: OneUINativeTheme | null,
  darkMode: boolean,
): PillTokens {
  if (theme) {
    const neutral: NativeRoleTokens =
      theme.rootRoles.neutral ?? Object.values(theme.rootRoles)[0]!;
    return {
      onColor: neutral.content.high,
      inactiveBg: neutral.surfaces.subtle,
      activeBg: neutral.surfaces.bold,
      activeFg: neutral.onBoldContent.high,
      labelXS: readLabelSize(theme, 'XS', 'medium'),
      labelS: readLabelSize(theme, 'S', 'medium'),
    };
  }
  const fb = darkMode ? FALLBACK_DARK : FALLBACK_LIGHT;
  return {
    onColor: fb.on,
    inactiveBg: fb.inactive,
    activeBg: fb.activeBg,
    activeFg: fb.activeFg,
    labelXS: null,
    labelS: null,
  };
}

export function BrandPickerHeader({
  brands,
  activeId,
  onSelect,
  darkMode,
}: BrandPickerHeaderProps) {
  const theme = useOptionalOneUITheme();
  const t = derivePillTokens(theme, darkMode);

  const labelStyle = t.labelXS
    ? {
        fontSize: t.labelXS.fontSize,
        lineHeight: t.labelXS.lineHeight,
        fontFamily: t.labelXS.fontFamily,
        fontWeight: t.labelXS.fontWeight,
      }
    : styles.labelFallback;

  const pillTextStyle = t.labelS
    ? {
        fontSize: t.labelS.fontSize,
        lineHeight: t.labelS.lineHeight,
        fontFamily: t.labelS.fontFamily,
        fontWeight: t.labelS.fontWeight,
      }
    : styles.pillTextFallback;

  const wrapStyle = theme
    ? { gap: theme.spacing['1-5'], marginBottom: theme.spacing['3'] }
    : styles.wrapFallback;

  const rowStyle = theme
    ? { gap: theme.spacing['1-5'], paddingRight: theme.spacing['4'] }
    : styles.rowFallback;

  const pillTokenStyle = theme
    ? {
        paddingHorizontal: theme.spacing['3'],
        paddingVertical: theme.spacing['1-5'],
        borderRadius: theme.shape.Pill,
      }
    : styles.pillFallback;

  return (
    <View style={[styles.wrap, wrapStyle]}>
      <Text style={[styles.label, labelStyle, { color: t.onColor }]}>Brand</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, rowStyle]}
      >
        {brands.map((brand) => {
          const active = brand._id === activeId;
          return (
            <Pressable
              key={brand._id}
              onPress={() => onSelect(brand._id)}
              style={[
                styles.pill,
                pillTokenStyle,
                { backgroundColor: active ? t.activeBg : t.inactiveBg },
              ]}
            >
              <Text
                style={[pillTextStyle, { color: active ? t.activeFg : t.onColor }]}
                numberOfLines={1}
              >
                {brand.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  wrapFallback: { gap: 6, marginBottom: 12 },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.7,
  },
  labelFallback: { fontSize: 11, fontWeight: '600' },
  row: {},
  rowFallback: { gap: 6, paddingRight: 16 },
  pill: {},
  pillFallback: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  pillTextFallback: { fontSize: 13, fontWeight: '600' },
});
