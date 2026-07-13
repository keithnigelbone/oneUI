/**
 * Pagination.showcase.native.tsx
 *
 * Parity with `packages/ui/src/components/Pagination/Pagination.showcase.tsx`.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { PaginationAppearance, PaginationAttention, PaginationSize } from './interface';
import { Pagination } from './Pagination.native';
import { PaginationItem } from './PaginationItem.native';
import { Surface, useSurfaceTokens, useTypographyTokens, typographyToTextStyle } from '../../theme';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4-5'],
  alignItems: 'flex-start',
};

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: tokens.spacing['4'],
  flexWrap: 'wrap',
};

const ATTENTIONS: readonly PaginationAttention[] = ['high', 'medium', 'low'];
const SIZES: readonly PaginationSize[] = ['S', 'M', 'L'];

const APPEARANCES: readonly PaginationAppearance[] = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const typo = useTypographyTokens('label', 'XS', { emphasis: 'low' });
  return (
    <Text style={StyleSheet.flatten([typographyToTextStyle(typo), { color: role.content.low }])}>
      {children}
    </Text>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const typo = useTypographyTokens('label', 'S', { emphasis: 'medium' });
  return (
    <Text style={StyleSheet.flatten([typographyToTextStyle(typo), { color: role.content.high }])}>
      {children}
    </Text>
  );
}

export function PaginationDefault(): React.ReactElement {
  return (
    <Pagination totalPages={10} defaultPage={1} aria-label="Default pagination" />
  );
}

export function PaginationSizesAttention(): React.ReactElement {
  return (
    <View style={column}>
      {ATTENTIONS.map((attention) => (
        <View key={attention} style={{ gap: tokens.spacing['2-5'] }}>
          <SectionLabel>attention = {attention}</SectionLabel>
          {SIZES.map((size) => (
            <View key={size} style={{ gap: tokens.spacing['2'] }}>
              <Label>size = {size}</Label>
              <Pagination
                totalPages={12}
                defaultPage={4}
                attention={attention}
                size={size}
                aria-label={`${attention} ${size}`}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function PaginationAppearances(): React.ReactElement {
  return (
    <View style={column}>
      {APPEARANCES.map((appearance) => (
        <View key={appearance} style={{ gap: tokens.spacing['2-5'] }}>
          <Label>{appearance}</Label>
          <Pagination
            totalPages={12}
            defaultPage={4}
            appearance={appearance}
            aria-label={`${appearance} appearance`}
          />
        </View>
      ))}
    </View>
  );
}

export function PaginationControlled(): React.ReactElement {
  const [page, setPage] = useState(7);
  return (
    <View style={[column, { alignItems: 'center' }]}>
      <Pagination
        totalPages={20}
        page={page}
        onPageChange={setPage}
        siblingCount={1}
        boundaryCount={1}
        aria-label="Controlled pagination"
      />
      <Label>Current page: {page}</Label>
    </View>
  );
}

export function PaginationWithFirstLast(): React.ReactElement {
  return (
    <Pagination
      totalPages={50}
      defaultPage={25}
      siblingCount={1}
      boundaryCount={1}
      showFirstLast
      showPrevNext
      aria-label="Big sequence with first/last"
    />
  );
}

export function PaginationEdgeCases(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <Label>1 page</Label>
        <Pagination totalPages={1} defaultPage={1} aria-label="Single page" />
      </View>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <Label>2 pages</Label>
        <Pagination totalPages={2} defaultPage={1} aria-label="Two pages" />
      </View>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <Label>5 pages (no ellipsis)</Label>
        <Pagination totalPages={5} defaultPage={3} aria-label="Five pages" />
      </View>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <Label>Disabled</Label>
        <Pagination totalPages={10} defaultPage={4} disabled aria-label="Disabled" />
      </View>
    </View>
  );
}

export function PaginationSurfaceContext(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <SectionLabel>default surface</SectionLabel>
        <Pagination totalPages={12} defaultPage={4} aria-label="On default surface" />
      </View>

      <Surface mode="subtle" style={{ padding: tokens.spacing['4-5'], width: '100%' }}>
        <SectionLabel>subtle surface</SectionLabel>
        <Pagination totalPages={12} defaultPage={4} aria-label="On subtle surface" />
      </Surface>

      <Surface mode="moderate" style={{ padding: tokens.spacing['4-5'], width: '100%' }}>
        <SectionLabel>moderate surface</SectionLabel>
        <Pagination totalPages={12} defaultPage={4} aria-label="On moderate surface" />
      </Surface>

      <Surface mode="bold" style={{ padding: tokens.spacing['4-5'], width: '100%' }}>
        <SectionLabel>bold surface</SectionLabel>
        <Pagination totalPages={12} defaultPage={4} aria-label="On bold surface" />
      </Surface>
    </View>
  );
}

export function PaginationItemShowcase(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['2-5'] }}>
        <SectionLabel>Numbered (selected vs not, all attentions)</SectionLabel>
        <View style={row}>
          {ATTENTIONS.map((attention) => (
            <View key={attention} style={{ alignItems: 'center', gap: tokens.spacing['2'] }}>
              <Label>{attention}</Label>
              <View style={row}>
                <PaginationItem page={3} attention={attention} aria-label="Page 3" />
                <PaginationItem
                  page={4}
                  attention={attention}
                  selected
                  aria-label="Page 4 (selected)"
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: tokens.spacing['2-5'] }}>
        <SectionLabel>Sizes</SectionLabel>
        <View style={row}>
          {SIZES.map((size) => (
            <PaginationItem key={size} page={1} size={size} selected aria-label={`Size ${size}`} />
          ))}
        </View>
      </View>

      <View style={{ gap: tokens.spacing['2-5'] }}>
        <SectionLabel>Nav + ellipsis (composite Pagination)</SectionLabel>
        <Pagination totalPages={15} defaultPage={8} showFirstLast aria-label="Showcase nav row" />
      </View>

      <View style={{ gap: tokens.spacing['2-5'] }}>
        <SectionLabel>Disabled nav (composite)</SectionLabel>
        <Pagination
          totalPages={10}
          defaultPage={1}
          disabled
          showFirstLast
          aria-label="Disabled nav"
        />
      </View>
    </View>
  );
}

export function PaginationFocusState(): React.ReactElement {
  return (
    <View style={column}>
      <Label>Focus the current page chip to preview the halo</Label>
      <Pagination totalPages={10} defaultPage={4} aria-label="Focused" />
    </View>
  );
}
