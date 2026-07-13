/**
 * Tabs.styles.native.ts — geometry peer of Tabs.module.css (sizes, padding, indicator).
 */

import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { TabsOrientation, TabsSize } from './interface';

const S = tokens.spacing;

export interface TabItemLayoutMetrics {
  tabHeight: number;
  stateLayerPaddingHorizontal: number;
  stateLayerBorderRadius: number;
  slotGap: number;
  labelSize: 'XS' | 'S' | 'M';
}

type SizeOrientationKey = `${TabsSize}:${TabsOrientation}`;

export const TAB_METRICS: Record<SizeOrientationKey, TabItemLayoutMetrics> = {
  's:horizontal': {
    tabHeight: S['8'],
    stateLayerPaddingHorizontal: S['2'],
    stateLayerBorderRadius: tokens.shape['2'],
    slotGap: S['1'],
    labelSize: 'XS',
  },
  'm:horizontal': {
    tabHeight: S['10'],
    stateLayerPaddingHorizontal: S['2-5'],
    stateLayerBorderRadius: tokens.shape['1-5'],
    slotGap: S['1'],
    labelSize: 'S',
  },
  'l:horizontal': {
    tabHeight: S['12'],
    stateLayerPaddingHorizontal: S['3'],
    stateLayerBorderRadius: tokens.shape['2'],
    slotGap: S['1'],
    labelSize: 'M',
  },
  's:vertical': {
    tabHeight: S['8'],
    stateLayerPaddingHorizontal: S['2-5'],
    stateLayerBorderRadius: tokens.shape['2'],
    slotGap: S['1'],
    labelSize: 'XS',
  },
  'm:vertical': {
    tabHeight: S['10'],
    stateLayerPaddingHorizontal: S['3'],
    stateLayerBorderRadius: tokens.shape['1-5'],
    slotGap: S['1'],
    labelSize: 'S',
  },
  'l:vertical': {
    tabHeight: S['12'],
    stateLayerPaddingHorizontal: S['3-5'],
    stateLayerBorderRadius: tokens.shape['2'],
    slotGap: S['1'],
    labelSize: 'M',
  },
};

export function resolveTabItemLayout(
  size: TabsSize,
  orientation: TabsOrientation
): TabItemLayoutMetrics {
  return TAB_METRICS[`${size}:${orientation}`];
}

/** Vertical indicator bar height per size — peer of Tabs.module.css `--_indicator-v-h`. */
export const VERTICAL_INDICATOR_HEIGHT: Record<TabsSize, number> = {
  s: S['6'],
  m: S['8'],
  l: S['9'],
};

/** Peer of `--Tabs-indicatorThickness` / `--Stroke-XL`. */
export const INDICATOR_THICKNESS = tokens.borderWidth.thin;

/** Peer of `--Tabs-indicatorRadius` / `--Shape-0-5`. */
export const INDICATOR_RADIUS = S['0-5'];

/** Peer of `--Tabs-panelPadding` / `--Spacing-4`. */
export const PANEL_PADDING = S['4'];

// INTENTIONAL-LITERAL: matches web `--Disabled-Opacity`
export const DISABLED_OPACITY = 0.38;

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
  },
  rootVertical: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  list: {
    position: 'relative',
    flexDirection: 'row',
    gap: S['0'],
    zIndex: tokens.zIndex.base,
  },
  listVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  listScrollViewport: {
    width: '100%',
    flexGrow: 0,
  },
  listScrollViewportVertical: {
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: 'flex-start',
    maxHeight: '100%',
  },
  tabPressable: {
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  tabPressableVertical: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  stateLayer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  stateLayerVertical: {
    justifyContent: 'flex-start',
    width: '100%',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotStart: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEnd: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
  },
  panel: {},
  indicator: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});

export function tabPressableStyle(orientation: TabsOrientation, tabHeight: number): ViewStyle {
  return {
    ...styles.tabPressable,
    ...(orientation === 'vertical' ? styles.tabPressableVertical : {}),
    height: tabHeight,
    minHeight: tabHeight,
  };
}

export function stateLayerStyle(
  metrics: TabItemLayoutMetrics,
  orientation: TabsOrientation
): ViewStyle {
  return {
    ...styles.stateLayer,
    ...(orientation === 'vertical' ? styles.stateLayerVertical : null),
    minHeight: metrics.tabHeight,
    height: metrics.tabHeight,
    paddingHorizontal: metrics.stateLayerPaddingHorizontal,
    borderRadius: metrics.stateLayerBorderRadius,
  };
}
