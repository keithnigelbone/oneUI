import { StyleSheet, Text, View } from 'react-native';
import {
  useOneUITheme,
  useSurfaceTokens,
  useTypographyTokens,
} from '@oneui/ui-native';
import type { ComponentAppearance } from '@oneui/shared';

interface ActiveTokensPanelProps {
  brandName: string;
  darkMode: boolean;
}

const ROLES_TO_PROBE: Array<{ role: ComponentAppearance; label: string }> = [
  { role: 'primary', label: 'Primary' },
  { role: 'secondary', label: 'Secondary' },
  { role: 'positive', label: 'Positive' },
  { role: 'negative', label: 'Negative' },
];

export function ActiveTokensPanel({ brandName, darkMode }: ActiveTokensPanelProps) {
  const onColor = darkMode ? '#fff' : '#111';
  const cardBg = darkMode ? '#1a1a1a' : '#f7f7f7';

  const theme = useOneUITheme();
  const headlineL = useTypographyTokens('headline', 'L');
  const titleM = useTypographyTokens('title', 'M');
  const bodyM = useTypographyTokens('body', 'M');
  const labelS = useTypographyTokens('label', 'S');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          padding: theme.spacing['3'],
          borderRadius: theme.shape.XS,
          marginBottom: theme.spacing['4'],
          gap: theme.spacing['2-5'],
        },
      ]}
    >
      <View style={[styles.header, { gap: theme.spacing['0-5'] }]}>
        <Text style={[styles.kicker, { color: onColor }]}>Active brand</Text>
        <Text style={[styles.name, { color: onColor }]} numberOfLines={1}>
          {brandName}
        </Text>
      </View>

      <View style={[styles.swatchRow, { gap: theme.spacing['3'] }]}>
        {ROLES_TO_PROBE.map(({ role, label }) => (
          <RoleSwatch key={role} role={role} label={label} darkMode={darkMode} />
        ))}
      </View>

      <View style={styles.divider} />

      <View style={[styles.typeBlock, { gap: theme.spacing['1-5'] }]}>
        <Text style={[styles.kicker, { color: onColor }]}>Typography</Text>
        <Text style={[styles.fontFamily, { color: onColor }]}>
          Primary: {theme.typography.fontFamilies.primary} · Code:{' '}
          {theme.typography.fontFamilies.code}
        </Text>

        <Text
          style={{
            color: onColor,
            fontSize: headlineL.fontSize,
            lineHeight: headlineL.lineHeight,
            fontFamily: headlineL.fontFamily,
            fontWeight: headlineL.fontWeight,
          }}
        >
          Headline L · {Math.round(headlineL.fontSize)}/{Math.round(headlineL.lineHeight)}
        </Text>
        <Text
          style={{
            color: onColor,
            fontSize: titleM.fontSize,
            lineHeight: titleM.lineHeight,
            fontFamily: titleM.fontFamily,
            fontWeight: titleM.fontWeight,
          }}
        >
          Title M · {Math.round(titleM.fontSize)}/{Math.round(titleM.lineHeight)}
        </Text>
        <Text
          style={{
            color: onColor,
            fontSize: bodyM.fontSize,
            lineHeight: bodyM.lineHeight,
            fontFamily: bodyM.fontFamily,
            fontWeight: bodyM.fontWeight,
          }}
        >
          Body M · {Math.round(bodyM.fontSize)}/{Math.round(bodyM.lineHeight)} —
          The quick brown fox.
        </Text>
        <Text
          style={{
            color: onColor,
            fontSize: labelS.fontSize,
            lineHeight: labelS.lineHeight,
            fontFamily: labelS.fontFamily,
            fontWeight: labelS.fontWeight,
          }}
        >
          Label S · {Math.round(labelS.fontSize)}/{Math.round(labelS.lineHeight)}
        </Text>
      </View>
    </View>
  );
}

function RoleSwatch({
  role,
  label,
  darkMode,
}: {
  role: ComponentAppearance;
  label: string;
  darkMode: boolean;
}) {
  const theme = useOneUITheme();
  const tokens = useSurfaceTokens(role);
  const fill = tokens.surfaces.bold;
  const onColor = darkMode ? '#fff' : '#111';
  return (
    <View style={[styles.swatch, { gap: theme.spacing['1'] }]}>
      <View
        style={[
          styles.swatchChip,
          { backgroundColor: fill, borderRadius: theme.shape['4XS'] },
        ]}
      />
      <Text style={[styles.swatchLabel, { color: onColor }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.swatchValue, { color: onColor }]} numberOfLines={1}>
        {fill}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  header: {},
  kicker: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.6,
  },
  name: { fontSize: 16, fontWeight: '700' },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap' },
  swatch: { width: 84 },
  swatchChip: {
    width: '100%',
    height: 28,
  },
  swatchLabel: { fontSize: 11, fontWeight: '600' },
  swatchValue: { fontSize: 10, opacity: 0.6, fontFamily: 'Courier' },
  divider: { height: 1, backgroundColor: '#0001' },
  typeBlock: {},
  fontFamily: { fontSize: 11, opacity: 0.6, fontFamily: 'Courier' },
});
