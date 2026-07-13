/**
 * CarouselSelectionRail.native.tsx
 *
 * Figma `.CarouselSelectionRail/*` — horizontal thumbnail rail for carousel
 * `controlsType=selectionRail`. Item set: `2801:40275`. Layouts:
 * `onMediaTrue` `2818:50556`, `onMediaFalse` `2818:52549`.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@oneui/tokens';
import { STROKE_SCALE_TOKENS } from '@oneui/shared';
import { PRESSED_OPACITY } from '../Image/Image.styles.native';
import { useSurfaceTokens } from '../../theme';
import { useCarousel } from './carouselContexts.native';
import { tagCarouselControlPart } from './carouselControlsParts.native';
import {
  clampSelectionRailIndex,
  resolveCarouselSelectionRailItemSize,
  resolveCarouselSelectionRailPaddingHorizontal,
  resolveCarouselSelectionRailPeekAlignInset,
  resolveCarouselSelectionRailSize,
  resolveCarouselSelectionRailSurface,
  type CarouselSelectionRailSize,
  type CarouselSelectionRailSurface,
} from './carouselSelectionRailLayout.native';

export type { CarouselSelectionRailSize, CarouselSelectionRailSurface } from './carouselSelectionRailLayout.native';

export interface CarouselSelectionRailItemData {
  src: string | ImageSourcePropType;
  alt: string;
}

export interface CarouselSelectionRailItemProps {
  src: string | ImageSourcePropType;
  alt: string;
  active?: boolean;
  /** Defaults from parent rail `onMedia` when omitted. */
  surface?: CarouselSelectionRailSurface;
  size: number;
  itemRadius: number;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export interface CarouselSelectionRailProps {
  /**
   * `true` → on-media strip (`surface=transparent`); `false` → below media.
   * Inside `Carousel.SelectionRail` this is injected from the parent
   * `Carousel.Controls` `placement` — don't set it manually there. Only the
   * standalone rail uses it directly.
   */
  onMedia?: boolean;
  size?: CarouselSelectionRailSize;
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  items?: CarouselSelectionRailItemData[];
  'aria-label'?: string;
  /** When peek is on, aligns below-media rail with the active slide left edge. */
  peekAlignInset?: number;
  style?: ViewStyle;
  testID?: string;
}

export interface CarouselSelectionRailListProps
  extends Omit<CarouselSelectionRailProps, 'activeIndex' | 'onActiveIndexChange'> {
  /** Thumbnail sources — one per slide (not inferred from `Carousel.Rail` yet). */
  items: CarouselSelectionRailItemData[];
}

// ─── Geometry (Figma dimension tokens) ───────────────────────────────────────

const STROKE_M =
  STROKE_SCALE_TOKENS.find((stroke) => stroke.key === 'M' && stroke.kind === 'fixed')?.px ??
  tokens.borderWidth.hairline;
const STROKE_2XL =
  STROKE_SCALE_TOKENS.find((stroke) => stroke.key === '2XL' && stroke.kind === 'fixed')?.px ??
  tokens.borderWidth.thin;

export { resolveCarouselSelectionRailSize, resolveCarouselSelectionRailSurface } from './carouselSelectionRailLayout.native';

function useSelectionRailIndex(props: Pick<
  CarouselSelectionRailProps,
  'activeIndex' | 'defaultActiveIndex' | 'onActiveIndexChange' | 'items'
>) {
  const count = props.items?.length ?? 0;
  const isControlled = props.activeIndex !== undefined;
  const [internal, setInternal] = useState(props.defaultActiveIndex ?? 0);
  const activeIndex = isControlled ? (props.activeIndex ?? 0) : internal;
  const clamped = clampSelectionRailIndex(activeIndex, count);

  const setActive = useCallback(
    (index: number) => {
      const next = clampSelectionRailIndex(index, count);
      if (!isControlled) setInternal(next);
      props.onActiveIndexChange?.(next);
    },
    [isControlled, count, props],
  );

  return { clamped, setActive, count };
}

// ─── Item ────────────────────────────────────────────────────────────────────

function SelectionRailItem({
  src,
  alt,
  active = false,
  surface = 'opaque',
  size,
  itemRadius,
  onPress,
  style: styleProp,
  testID,
}: CarouselSelectionRailItemProps): React.ReactElement {
  const primary = useSurfaceTokens('primary');
  const neutral = useSurfaceTokens('neutral');
  const role = surface === 'transparent' ? neutral : primary;

  const shellBg =
    surface === 'transparent' ? neutral.surfaces.subtle : primary.surfaces.default;
  const imageBorder = role.content.strokeMedium;
  const activeRing = role.content.tinted;

  const imageSource = typeof src === 'string' ? { uri: src } : src;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={alt}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.itemShell,
        {
          width: size,
          height: size,
          borderRadius: itemRadius,
          backgroundColor: shellBg,
          opacity: pressed && !active ? PRESSED_OPACITY : 1,
        },
        styleProp,
      ]}
      testID={testID}
    >
      <View
        style={[
          styles.itemImageFrame,
          {
            borderRadius: itemRadius,
            borderWidth: STROKE_M,
            borderColor: imageBorder,
          },
        ]}
      >
        <Image
          source={imageSource}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          resizeMode="cover"
          style={styles.itemImage as ImageStyle}
        />
      </View>
      {active ? (
        <View
          pointerEvents="none"
          style={[
            styles.itemActiveRing,
            {
              borderRadius: itemRadius,
              borderWidth: STROKE_2XL,
              borderColor: activeRing,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

// ─── Rail ────────────────────────────────────────────────────────────────────

function CarouselSelectionRailRoot({
  onMedia = false,
  size = 's',
  activeIndex,
  defaultActiveIndex,
  onActiveIndexChange,
  items = [],
  'aria-label': ariaLabel = 'Slide thumbnails',
  peekAlignInset,
  style: styleProp,
  testID,
}: CarouselSelectionRailProps): React.ReactElement | null {
  const resolvedSize = resolveCarouselSelectionRailSize(size, onMedia);
  const surface = resolveCarouselSelectionRailSurface(onMedia);
  const itemSize = resolveCarouselSelectionRailItemSize(resolvedSize);
  const itemRadius = tokens.shape['2'];
  const { clamped, setActive, count } = useSelectionRailIndex({
    activeIndex,
    defaultActiveIndex,
    onActiveIndexChange,
    items,
  });

  const railStyle = useMemo(
    () => [
      styles.rail,
      {
        gap: tokens.spacing['2'],
        paddingHorizontal: resolveCarouselSelectionRailPaddingHorizontal(
          onMedia,
          peekAlignInset,
        ),
        ...(onMedia
          ? { height: tokens.spacing['28'], alignItems: 'center' as const }
          : { alignSelf: 'stretch' as const }),
      },
      styleProp,
    ],
    [onMedia, peekAlignInset, styleProp],
  );

  if (count === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={ariaLabel}
      style={onMedia ? undefined : styles.railBelowMediaScroll}
      contentContainerStyle={railStyle}
      testID={testID}
    >
      {items.map((item, index) => (
        <SelectionRailItem
          key={`${item.alt}-${index}`}
          src={item.src}
          alt={item.alt}
          active={index === clamped}
          surface={surface}
          size={itemSize}
          itemRadius={itemRadius}
          onPress={() => setActive(index)}
          testID={testID ? `${testID}-item-${index}` : undefined}
        />
      ))}
    </ScrollView>
  );
}

/** Carousel-context peer of `Carousel.IndicatorList` — drives `scrollTo` from rail taps. */
export function CarouselSelectionRailList({
  items,
  onMedia = false,
  size = 's',
  'aria-label': ariaLabel,
  style: styleProp,
  testID,
}: CarouselSelectionRailListProps): React.ReactElement | null {
  const { selectedIndex, scrollTo, peek, viewportWidth, slideWidth } = useCarousel();
  const peekAlignInset = resolveCarouselSelectionRailPeekAlignInset(
    onMedia,
    peek,
    viewportWidth,
    slideWidth,
  );
  if (items.length === 0) return null;
  return (
    <CarouselSelectionRailRoot
      onMedia={onMedia}
      size={size}
      activeIndex={selectedIndex}
      onActiveIndexChange={scrollTo}
      peekAlignInset={peekAlignInset}
      items={items}
      aria-label={ariaLabel ?? 'Slide thumbnails'}
      style={styleProp}
      testID={testID}
    />
  );
}

export const CarouselSelectionRail = Object.assign(CarouselSelectionRailRoot, {
  Item: SelectionRailItem,
});

tagCarouselControlPart(CarouselSelectionRailRoot, 'selection-rail');
tagCarouselControlPart(CarouselSelectionRailList, 'selection-rail');

// ─── Static layout ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  railBelowMediaScroll: {
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
  },
  itemShell: {
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImageFrame: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  itemImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  itemActiveRing: {
    ...StyleSheet.absoluteFillObject,
  },
});
