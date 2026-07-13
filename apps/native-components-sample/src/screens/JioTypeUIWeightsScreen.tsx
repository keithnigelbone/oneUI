/**
 * JioType — bundled weight ladder.
 *
 * Each row uses a distinct `fontFamily` key registered from
 * `assets/fonts/JioType/*.ttf` (see `src/fonts/bundledFontFamilies.ts`).
 * Stock React Native does not reliably map `fontWeight` to custom faces;
 * per-weight static files + explicit `fontFamily` is the supported pattern.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { tokens } from '@oneui/tokens';
import { Text as OneUIText, useSurfaceTokens, useTypographyTokens } from '@oneui/ui-native';
import { ComponentsChrome } from '../components/ComponentsChrome';
import { JIOTYPE_WEIGHT_SHOWCASE_ROWS } from '../fonts/bundledFontFamilies';

import type { ComponentsStackParamList } from './components/ComponentsStack';

type Props = NativeStackScreenProps<ComponentsStackParamList, 'FontWeights'>;

const SAMPLE_LATIN = 'The quick brown fox jumps over the lazy dog. 0123456789';

const SCRIPT_DEMO_ROWS = [
  { code: 'hi', label: 'Hindi', sample: 'वन यू डिज़ाइन सिस्टम — हिंदी टाइपोग्राफी' },
  { code: 'ta', label: 'Tamil', sample: 'வன் யூ வடிவமைப்பு — தமிழ் எழுத்துரு' },
  { code: 'bn', label: 'Bengali', sample: 'ওয়ান ইউ টাইপোগ্রাফি — বাংলা' },
] as const;

export function JioTypeUIWeightsScreen({ navigation }: Props): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const titleTypo = useTypographyTokens('title', 'L', { emphasis: 'medium' });
  const labelTypo = useTypographyTokens('label', 'S', { emphasis: 'medium' });
  const bodyTypo = useTypographyTokens('body', 'S', { emphasis: 'low' });
  const sampleTypo = useTypographyTokens('headline', 'S', { emphasis: 'low' });

  return (
    <View style={[styles.outer, { backgroundColor: roles.surfaces.default }]}>
      <ComponentsChrome
        variant='fontWeights'
        navigation={navigation}
        title='Font weights'
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text
          style={{
            color: roles.content.high,
            fontFamily: titleTypo.fontFamily,
            fontSize: titleTypo.fontSize,
            lineHeight: titleTypo.lineHeight,
            fontWeight: titleTypo.fontWeight,
          }}
        >
          JioType (bundled static cuts)
        </Text>
        <Text
          style={{
            color: roles.content.medium,
            fontFamily: bodyTypo.fontFamily,
            fontSize: bodyTypo.fontSize,
            lineHeight: bodyTypo.lineHeight,
            fontWeight: bodyTypo.fontWeight,
            marginTop: tokens.spacing['3-5'],
          }}
        >
          Files under assets/fonts/JioType/. Theme maps CSS weights to these Expo
          keys via staticWeightFamilies in foundationToNativeTheme.
        </Text>

        <View style={{ height: tokens.spacing['4-5'] }} />

        <Text
          style={{
            color: roles.content.high,
            fontFamily: titleTypo.fontFamily,
            fontSize: titleTypo.fontSize,
            lineHeight: titleTypo.lineHeight,
            fontWeight: titleTypo.fontWeight,
            marginTop: tokens.spacing['6'],
          }}
        >
          Regional scripts
        </Text>
        <Text
          style={{
            color: roles.content.medium,
            fontFamily: bodyTypo.fontFamily,
            fontSize: bodyTypo.fontSize,
            lineHeight: bodyTypo.lineHeight,
            fontWeight: bodyTypo.fontWeight,
            marginTop: tokens.spacing['2'],
            marginBottom: tokens.spacing['3'],
          }}
        >
          Explicit `lang` on OneUI Text. Change Language in the header to see
          context-driven defaults (no `lang` prop) on the last row.
        </Text>

        {SCRIPT_DEMO_ROWS.map((row) => (
          <View
            key={row.code}
            style={[
              styles.row,
              {
                borderBottomColor: roles.content.strokeLow,
                paddingVertical: tokens.spacing['3'],
              },
            ]}
          >
            <Text
              style={{
                width: tokens.spacing['10'],
                color: roles.content.medium,
                fontFamily: labelTypo.fontFamily,
                fontSize: labelTypo.fontSize,
                lineHeight: labelTypo.lineHeight,
                fontWeight: labelTypo.fontWeight,
              }}
            >
              {row.label}
            </Text>
            <OneUIText variant='body' size='M' lang={row.code} style={{ flex: 1 }}>
              {row.sample}
            </OneUIText>
          </View>
        ))}

        <View
          style={[
            styles.row,
            {
              borderBottomColor: roles.content.strokeLow,
              paddingVertical: tokens.spacing['3'],
            },
          ]}
        >
          <Text
            style={{
              width: tokens.spacing['10'],
              color: roles.content.medium,
              fontFamily: labelTypo.fontFamily,
              fontSize: labelTypo.fontSize,
              lineHeight: labelTypo.lineHeight,
              fontWeight: labelTypo.fontWeight,
            }}
          >
            Context
          </Text>
          <OneUIText variant='body' size='M' style={{ flex: 1 }}>
            {SCRIPT_DEMO_ROWS[0].sample}
          </OneUIText>
        </View>

        <View style={{ height: tokens.spacing['6'] }} />

        {JIOTYPE_WEIGHT_SHOWCASE_ROWS.map((row) => (
          <View
            key={row.fontFamily}
            style={[
              styles.row,
              {
                borderBottomColor: roles.content.strokeLow,
                paddingVertical: tokens.spacing['4'],
              },
            ]}
          >
            <Text
              style={{
                width: tokens.spacing['8'],
                color: roles.content.medium,
                fontFamily: labelTypo.fontFamily,
                fontSize: labelTypo.fontSize,
                lineHeight: labelTypo.lineHeight,
                fontWeight: labelTypo.fontWeight,
              }}
            >
              {String(row.weight)}
            </Text>
            <Text
              style={{
                width: tokens.spacing['10'],
                color: roles.content.low,
                fontFamily: labelTypo.fontFamily,
                fontSize: labelTypo.fontSize,
                lineHeight: labelTypo.lineHeight,
                fontWeight: labelTypo.fontWeight,
              }}
            >
              {row.label}
            </Text>
            <Text
              style={{
                flex: 1,
                color: roles.content.high,
                fontFamily: row.fontFamily,
                fontSize: sampleTypo.fontSize,
                lineHeight: sampleTypo.lineHeight,
              }}
            >
              {SAMPLE_LATIN}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing['4-5'],
    paddingBottom: tokens.spacing['7'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing['4'],
    borderBottomWidth: tokens.borderWidth.hairline,
  },
});
