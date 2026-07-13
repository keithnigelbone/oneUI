import React from 'react';
import { buildNativeDimensions } from '@oneui/shared/engine';
import { tokens } from '@oneui/tokens';
import { describe, expect, it } from 'vitest';
import {
  contentAlignmentStyle,
  isCarouselContentCentered,
  isCarouselHorizontalCenter,
  resolveCarouselContentBlockLayout,
  resolveCarouselContentWidthStyle,
  resolveCarouselSlideContentInnerStyle,
  resolveCarouselSlideContentOverlayStyle,
  resolveCarouselSlideContentShellStyle,
  usesCarouselFullHeightContentOverlay,
} from './carouselContentLayout.native';
import {
  ON_MEDIA_CONTROLS_HEIGHT,
  resolveCarouselControlsLayout,
  resolveCarouselPaginationAlign,
  resolveOnMediaControlsContentInset,
} from './carouselControlsLayout.native';
import {
  hasBelowMediaSelectionRailChild,
  hasNavArrowChild,
  hasOnMediaSelectionRailChild,
  isCarouselNavArrowChild,
  tagCarouselControlPart,
  resolveCarouselControlPart,
  orderOnMediaControlChildren,
} from './carouselControlsParts.native';
import {
  resolveCarouselRootBelowGap,
  resolveCarouselPeek,
  resolveCarouselFlexibleSlideHeight,
  resolveCarouselSlideHeight,
  usesCarouselCustomSlideHeight,
} from './carouselRootLayout.native';
import {
  resolveCarouselContentSpacing,
  resolveCarouselSlideRadius,
} from './carouselRecipe.native';
import { PEEK_COLUMN_PADDING, PEEK_COLUMN_WIDTH, PEEK_INSET_PER_SIDE, PEEK_OFFSET, PEEK_VISIBLE_WIDTH, SLIDE_GAP } from './Carousel.styles.native';
import {
  resolveCarouselTrackContentStyle,
  resolveCarouselSnapOffset,
  resolvePeekViewportInset,
} from './carouselPeekLayout.native';
import type { CarouselControlsProps } from './interface';
import {
  ON_MEDIA_SELECTION_RAIL_HEIGHT,
  resolveCarouselSelectionRailItemSize,
  resolveCarouselSelectionRailPaddingHorizontal,
  resolveCarouselSelectionRailPeekAlignInset,
  resolveCarouselSelectionRailSize,
  resolveCarouselSelectionRailSurface,
  resolveOnMediaSelectionRailInset,
} from './carouselSelectionRailLayout.native';
import {
  CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  CAROUSEL_IMAGE_ASPECT_RATIOS,
  CAROUSEL_SLIDE_SCRIM_PROPS,
  formatCarouselSlidePosition,
  getCarouselAccessibilityProps,
  getCarouselRootAccessibilityProps,
  getCarouselRootNameAccessibilityProps,
  getCarouselSlideAccessibilityProps,
  getCarouselTrackLiveRegionProps,
  resolveCarouselAutoPlayStep,
  resolveCarouselContentMaxWidth,
  resolveCarouselImageAspectRatio,
  resolveCarouselLoop,
  resolveCarouselLoopClonePadding,
  resolveCarouselLoopSettle,
  resolveCarouselNavAvailability,
  resolveCarouselNearestSnapIndex,
  resolveCarouselScrollOffset,
  resolveCarouselSlideMetrics,
  resolveCarouselSlideScrimProps,
  resolveCarouselTargetIndex,
} from './interface';

// Real token values, not a hand-written stub. The previous literal was a
// fourth copy of the shape table and had drifted (its `L` was 20px; the real
// f1 step is 18px), which is precisely the class of bug the numeric scale
// exists to prevent.
const shape = buildNativeDimensions({ platform: 'S', density: 'default' }).shape;

function DemoNavButton(): React.ReactElement {
  return React.createElement('button', null, 'nav');
}

function DemoSelectionRail(props: { onMedia?: boolean }): React.ReactElement {
  return React.createElement('div', props, 'rail');
}

function DemoControls(
  _props: Omit<CarouselControlsProps, 'children'> & { children?: React.ReactNode },
): React.ReactElement {
  return React.createElement('div', null, 'controls');
}

describe('Carousel', () => {
  describe('loop', () => {
    it('resolves root loop prop over opts.loop', () => {
      expect(resolveCarouselLoop(true)).toBe(true);
      expect(resolveCarouselLoop(false, { loop: true })).toBe(false);
      expect(resolveCarouselLoop(undefined, { loop: true })).toBe(true);
      expect(resolveCarouselLoop()).toBe(false);
    });
  });

  // The engine hook (`useCarouselEngine`) delegates every index/offset/autoplay
  // decision to these pure helpers, so these cases exercise the same code the
  // rendered carousel runs. High-risk paths covered here: the loop-boundary
  // wrap (finding #2), the momentum nearest-snap calculation, the autoplay
  // advance/stop decision, and prev/next gating.
  describe('engine — target index', () => {
    it('clamps out-of-range requests when not looping', () => {
      expect(resolveCarouselTargetIndex(-1, 5, false)).toBe(0);
      expect(resolveCarouselTargetIndex(2, 5, false)).toBe(2);
      expect(resolveCarouselTargetIndex(5, 5, false)).toBe(4);
      expect(resolveCarouselTargetIndex(99, 5, false)).toBe(4);
    });

    it('wraps both boundaries when looping (last→first, first→last)', () => {
      expect(resolveCarouselTargetIndex(5, 5, true)).toBe(0); // past last → first
      expect(resolveCarouselTargetIndex(-1, 5, true)).toBe(4); // before first → last
      expect(resolveCarouselTargetIndex(6, 5, true)).toBe(1);
      expect(resolveCarouselTargetIndex(-6, 5, true)).toBe(4);
    });

    it('collapses to 0 for an empty carousel', () => {
      expect(resolveCarouselTargetIndex(3, 0, false)).toBe(0);
      expect(resolveCarouselTargetIndex(3, 0, true)).toBe(0);
    });
  });

  describe('engine — slide metrics', () => {
    it('returns zeroes until the viewport is measured', () => {
      expect(resolveCarouselSlideMetrics(0, 0, 14)).toEqual({ slideWidth: 0, slideStride: 0 });
    });

    it('subtracts the peek gutter and adds the slide gap to the stride', () => {
      expect(resolveCarouselSlideMetrics(360, 32, 14)).toEqual({
        slideWidth: 328,
        slideStride: 342,
      });
    });

    it('clamps to zero when the peek gutter exceeds the viewport', () => {
      expect(resolveCarouselSlideMetrics(20, 40, 14)).toEqual({ slideWidth: 0, slideStride: 0 });
    });
  });

  describe('engine — scroll offset', () => {
    const geom = { slideStride: 100, slideCount: 4, loop: false };

    it('returns null before the pager is measurable', () => {
      expect(resolveCarouselScrollOffset(1, { ...geom, slideStride: 0 })).toBeNull();
      expect(resolveCarouselScrollOffset(1, { ...geom, slideCount: 0 })).toBeNull();
    });

    it('maps a slide index to its pixel offset (index × stride)', () => {
      expect(resolveCarouselScrollOffset(0, geom)).toBe(0);
      expect(resolveCarouselScrollOffset(2, geom)).toBe(200);
    });

    it('clamps offsets to the last slide when not looping', () => {
      expect(resolveCarouselScrollOffset(4, geom)).toBe(300);
      expect(resolveCarouselScrollOffset(-1, geom)).toBe(0);
    });

    it('wraps the offset across the loop seam when there is no circular buffer', () => {
      // clonePad omitted (0) → buffer-less fallback still wraps the index.
      const loopGeom = { ...geom, loop: true };
      expect(resolveCarouselScrollOffset(4, loopGeom)).toBe(0);
      expect(resolveCarouselScrollOffset(-1, loopGeom)).toBe(300);
    });

    it('shifts by the clone pad and does NOT wrap when a circular buffer exists', () => {
      // With clones, overshooting an end deliberately targets a clone slot so
      // the wrap can animate continuously; the realign happens after settle.
      const loopGeom = { ...geom, loop: true, clonePad: 1 };
      expect(resolveCarouselScrollOffset(0, loopGeom)).toBe(100); // real first sits past lead clone
      expect(resolveCarouselScrollOffset(3, loopGeom)).toBe(400); // real last
      expect(resolveCarouselScrollOffset(4, loopGeom)).toBe(500); // trailing clone (shows first)
      expect(resolveCarouselScrollOffset(-1, loopGeom)).toBe(0); // leading clone (shows last)
    });
  });

  // Single source of truth for momentum-snap: used by CarouselRail's
  // onMomentumScrollEnd / onScrollEndDrag. Returns the RAW nearest index; the
  // wrap/clamp is applied separately by resolveCarouselTargetIndex (above).
  describe('engine — nearest snap index', () => {
    it('returns 0 when nothing is measurable yet', () => {
      expect(resolveCarouselNearestSnapIndex(240, undefined, 0)).toBe(0);
      expect(resolveCarouselNearestSnapIndex(240, [], 0)).toBe(0);
    });

    it('rounds offset / stride when no snap offsets are supplied', () => {
      expect(resolveCarouselNearestSnapIndex(149, undefined, 100)).toBe(1);
      expect(resolveCarouselNearestSnapIndex(150, undefined, 100)).toBe(2);
      expect(resolveCarouselNearestSnapIndex(151, undefined, 100)).toBe(2);
    });

    it('picks the closest of non-uniform peek snap offsets (offsets win over stride)', () => {
      // Peek offsets are NOT multiples of the stride — the min-distance search
      // must win, otherwise offset / stride would mis-snap.
      const snapOffsets = [0, 90, 190, 300];
      expect(resolveCarouselNearestSnapIndex(0, snapOffsets, 100)).toBe(0);
      expect(resolveCarouselNearestSnapIndex(44, snapOffsets, 100)).toBe(0);
      expect(resolveCarouselNearestSnapIndex(46, snapOffsets, 100)).toBe(1);
      expect(resolveCarouselNearestSnapIndex(260, snapOffsets, 100)).toBe(3);
    });

    it('does not clamp/wrap — a beyond-end settle returns the raw rounded index', () => {
      // wrap/clamp is the caller's job via resolveCarouselTargetIndex.
      expect(resolveCarouselNearestSnapIndex(999, undefined, 100)).toBe(10);
      expect(resolveCarouselTargetIndex(resolveCarouselNearestSnapIndex(999, undefined, 100), 5, false)).toBe(4);
      expect(resolveCarouselTargetIndex(resolveCarouselNearestSnapIndex(999, undefined, 100), 5, true)).toBe(0);
    });
  });

  describe('engine — nav availability', () => {
    it('disables prev at the first slide and next at the last when not looping', () => {
      expect(resolveCarouselNavAvailability(0, 3, false)).toEqual({
        canScrollPrev: false,
        canScrollNext: true,
      });
      expect(resolveCarouselNavAvailability(2, 3, false)).toEqual({
        canScrollPrev: true,
        canScrollNext: false,
      });
    });

    it('disables both directions for an empty carousel', () => {
      expect(resolveCarouselNavAvailability(0, 0, false)).toEqual({
        canScrollPrev: false,
        canScrollNext: false,
      });
    });

    it('keeps both directions available at every index when looping', () => {
      expect(resolveCarouselNavAvailability(0, 3, true)).toEqual({
        canScrollPrev: true,
        canScrollNext: true,
      });
      expect(resolveCarouselNavAvailability(2, 3, true)).toEqual({
        canScrollPrev: true,
        canScrollNext: true,
      });
    });
  });

  describe('engine — autoplay step', () => {
    it('advances to the next slide while more remain', () => {
      expect(resolveCarouselAutoPlayStep(0, 4, false)).toEqual({ type: 'advance', index: 1 });
      expect(resolveCarouselAutoPlayStep(2, 4, false)).toEqual({ type: 'advance', index: 3 });
    });

    it('stops autoplay on the last slide when not looping', () => {
      expect(resolveCarouselAutoPlayStep(3, 4, false)).toEqual({ type: 'stop' });
      expect(resolveCarouselAutoPlayStep(9, 4, false)).toEqual({ type: 'stop' });
    });

    it('keeps advancing past the last slide when looping', () => {
      expect(resolveCarouselAutoPlayStep(3, 4, true)).toEqual({ type: 'advance', index: 4 });
    });

    it('loops seamlessly end-to-end: autoplay from last slide animates into the trailing clone', () => {
      // Compose the two decisions the interval effect makes each tick. With a
      // circular buffer, "next from last" animates FORWARD into the trailing
      // clone (offset past the last real slide) rather than rewinding to 0.
      const step = resolveCarouselAutoPlayStep(3, 4, true);
      expect(step).toEqual({ type: 'advance', index: 4 });
      const offset = resolveCarouselScrollOffset(step.type === 'advance' ? step.index : 0, {
        slideStride: 100,
        slideCount: 4,
        loop: true,
        clonePad: 1,
      });
      // 4 real slides + 1 lead clone → trailing clone sits at display index 5.
      expect(offset).toBe(500);
    });
  });

  describe('engine — loop circular buffer', () => {
    it('clones only for a looping rail with >1 slide, and 2 per side under peek', () => {
      // No peek → 1 clone per side is enough (only the centre slide shows).
      expect(resolveCarouselLoopClonePadding(true, 5, false)).toBe(1);
      expect(resolveCarouselLoopClonePadding(true, 2, false)).toBe(1);
      // Peek shows an outer-neighbour sliver → 2 clones per side pre-fill it.
      expect(resolveCarouselLoopClonePadding(true, 5, true)).toBe(2);
      expect(resolveCarouselLoopClonePadding(true, 2, true)).toBe(2);
      // Nothing to wrap.
      expect(resolveCarouselLoopClonePadding(true, 1, true)).toBe(0);
      expect(resolveCarouselLoopClonePadding(true, 0, true)).toBe(0);
      expect(resolveCarouselLoopClonePadding(false, 5, true)).toBe(0);
    });

    it('maps real display slots to their logical index with no realign', () => {
      // Display list: [clone(last), s0, s1, s2, s3, s4, clone(first)] for 5 slides.
      expect(resolveCarouselLoopSettle(1, 5, 1)).toEqual({
        logicalIndex: 0,
        realignOffsetIndex: null,
      });
      expect(resolveCarouselLoopSettle(3, 5, 1)).toEqual({
        logicalIndex: 2,
        realignOffsetIndex: null,
      });
      expect(resolveCarouselLoopSettle(5, 5, 1)).toEqual({
        logicalIndex: 4,
        realignOffsetIndex: null,
      });
    });

    it('settling on the trailing clone maps to first slide + realigns onto it', () => {
      // Display index 6 (trailing clone, shows s0) → logical 0, jump to display 1.
      expect(resolveCarouselLoopSettle(6, 5, 1)).toEqual({
        logicalIndex: 0,
        realignOffsetIndex: 1,
      });
    });

    it('settling on the leading clone maps to last slide + realigns onto it', () => {
      // Display index 0 (leading clone, shows s4) → logical 4, jump to display 5.
      expect(resolveCarouselLoopSettle(0, 5, 1)).toEqual({
        logicalIndex: 4,
        realignOffsetIndex: 5,
      });
    });

    it('is a plain clamp with no realign when there are no clones', () => {
      expect(resolveCarouselLoopSettle(3, 5, 0)).toEqual({
        logicalIndex: 3,
        realignOffsetIndex: null,
      });
      expect(resolveCarouselLoopSettle(9, 5, 0)).toEqual({
        logicalIndex: 4,
        realignOffsetIndex: null,
      });
      expect(resolveCarouselLoopSettle(-2, 5, 0)).toEqual({
        logicalIndex: 0,
        realignOffsetIndex: null,
      });
    });

    it('maps each clone to its own real slide with 2 clones per side (peek)', () => {
      // 5 slides, clonePad 2 → display list:
      // [s3, s4, s0, s1, s2, s3, s4, s0, s1]  (indices 0..8, real at 2..6)
      expect(resolveCarouselLoopSettle(0, 5, 2)).toEqual({ logicalIndex: 3, realignOffsetIndex: 5 });
      expect(resolveCarouselLoopSettle(1, 5, 2)).toEqual({ logicalIndex: 4, realignOffsetIndex: 6 });
      expect(resolveCarouselLoopSettle(2, 5, 2)).toEqual({ logicalIndex: 0, realignOffsetIndex: null });
      expect(resolveCarouselLoopSettle(6, 5, 2)).toEqual({ logicalIndex: 4, realignOffsetIndex: null });
      expect(resolveCarouselLoopSettle(7, 5, 2)).toEqual({ logicalIndex: 0, realignOffsetIndex: 2 });
      expect(resolveCarouselLoopSettle(8, 5, 2)).toEqual({ logicalIndex: 1, realignOffsetIndex: 3 });
    });

    it('round-trips a full forward wrap: last → trailing clone → realign onto first', () => {
      const geom = { slideStride: 100, slideCount: 5, loop: true, clonePad: 1 };
      // 1. Next from last (logical 4) targets display index 5+1 = 6 (offset 600).
      const wrapOffset = resolveCarouselScrollOffset(5, geom);
      expect(wrapOffset).toBe(600);
      // 2. Pager settles on display 6 → logical 0, realign to display 1 (offset 100).
      const settle = resolveCarouselLoopSettle(6, 5, 1);
      expect(settle).toEqual({ logicalIndex: 0, realignOffsetIndex: 1 });
      expect(settle.realignOffsetIndex! * geom.slideStride).toBe(100);
    });
  });

  describe('content width', () => {
    it('maps Figma 12-col spans to percentage max-widths', () => {
      expect(resolveCarouselContentMaxWidth('fill')).toBe('100%');
      expect(resolveCarouselContentMaxWidth('l')).toBe('66%');
      expect(resolveCarouselContentMaxWidth('m')).toBe('50%');
      expect(resolveCarouselContentMaxWidth('s')).toBe('33%');
    });

    it('pins fill width to both horizontal edges for start alignments', () => {
      expect(resolveCarouselContentWidthStyle('fill', 'startBottom')).toEqual({
        left: 0,
        right: 0,
        width: '100%',
        alignSelf: 'stretch',
      });
    });

    it('anchors capped widths to the start edge for start alignments', () => {
      expect(resolveCarouselContentWidthStyle('m', 'startBottom')).toEqual({
        left: 0,
        right: 0,
        maxWidth: '50%',
        width: '100%',
        alignSelf: 'flex-start',
      });
    });

    it('centers capped widths for middle* alignments (shell alignItems + inner alignSelf)', () => {
      expect(resolveCarouselContentWidthStyle('l', 'middleBottom')).toEqual({
        left: 0,
        right: 0,
        maxWidth: '66%',
        width: '100%',
        alignSelf: 'center',
      });
      expect(resolveCarouselContentWidthStyle('s', 'middleMiddle')).toEqual({
        left: 0,
        right: 0,
        maxWidth: '33%',
        width: '100%',
        alignSelf: 'center',
      });
    });

    it('stretches fill width for middle* alignments', () => {
      expect(resolveCarouselContentWidthStyle('fill', 'middleTop')).toEqual({
        left: 0,
        right: 0,
        width: '100%',
        alignSelf: 'stretch',
      });
    });

    it('positions overlay shell + inner per Figma alignment matrix', () => {
      expect(resolveCarouselSlideContentShellStyle('middleBottom', 'l')).toEqual({
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
      });
      expect(resolveCarouselSlideContentInnerStyle('middleBottom', 'l')).toEqual({
        maxWidth: '66%',
        width: '100%',
        alignSelf: 'center',
        alignItems: 'center',
      });
      expect(resolveCarouselSlideContentShellStyle('startMiddle', 'm')).toEqual({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'flex-start',
      });
      expect(resolveCarouselSlideContentInnerStyle('startMiddle', 'm')).toEqual({
        maxWidth: '50%',
        width: '100%',
        alignSelf: 'flex-start',
      });
      expect(resolveCarouselSlideContentOverlayStyle('middleMiddle', 'm')).toEqual({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '50%',
        width: '100%',
        alignSelf: 'center',
      });
      expect(resolveCarouselSlideContentShellStyle('middleTop', 'fill')).toEqual({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'flex-start',
      });
      expect(resolveCarouselSlideContentInnerStyle('middleTop', 'fill')).toEqual({
        width: '100%',
        alignSelf: 'stretch',
        flex: 1,
      });
    });
  });

  describe('content layout', () => {
    it('flags horizontal centering for middle* alignments only', () => {
      expect(isCarouselHorizontalCenter('middleBottom')).toBe(true);
      expect(isCarouselHorizontalCenter('middleMiddle')).toBe(true);
      expect(isCarouselHorizontalCenter('middleTop')).toBe(true);
      expect(isCarouselHorizontalCenter('startBottom')).toBe(false);
      expect(isCarouselContentCentered('middleTop')).toBe(true);
    });

    it('maps Figma ContentBlock flex structures', () => {
      expect(resolveCarouselContentBlockLayout('startMiddle')).toEqual({
        badgesRowFlex: 0,
        contentWrapperFlex: 0,
        contentClusterJustify: 'flex-end',
        trailingSpacerFlex: 1,
      });
      expect(resolveCarouselContentBlockLayout('middleMiddle')).toEqual({
        badgesRowFlex: 1,
        contentWrapperFlex: 0,
        contentClusterJustify: 'flex-end',
        trailingSpacerFlex: 1,
      });
      expect(resolveCarouselContentBlockLayout('middleTop')).toEqual({
        badgesRowFlex: 0,
        contentWrapperFlex: 1,
        contentClusterJustify: 'flex-start',
        trailingSpacerFlex: 0,
      });
      expect(resolveCarouselContentBlockLayout('startBottom')).toEqual({
        badgesRowFlex: 0,
        contentWrapperFlex: 0,
        contentClusterJustify: 'flex-start',
        trailingSpacerFlex: 0,
      });
      expect(resolveCarouselContentBlockLayout('middleBottom')).toEqual({
        badgesRowFlex: 0,
        contentWrapperFlex: 0,
        contentClusterJustify: 'flex-start',
        trailingSpacerFlex: 0,
      });
    });

    it('bottom-aligns startBottom and middleBottom overlays (web peer)', () => {
      expect(contentAlignmentStyle('startBottom')).toEqual({
        left: 0,
        bottom: 0,
        right: 0,
        alignItems: 'flex-start',
      });
      expect(contentAlignmentStyle('middleBottom')).toEqual({
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
      });
      expect(contentAlignmentStyle('startBottom')).not.toHaveProperty('top');
    });

    it('vertically centres startMiddle on fill width (web peer)', () => {
      expect(contentAlignmentStyle('startMiddle')).toEqual({
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'flex-start',
      });
    });

    it('uses full-height overlay only for middleMiddle and middleTop', () => {
      expect(usesCarouselFullHeightContentOverlay('startMiddle')).toBe(false);
      expect(usesCarouselFullHeightContentOverlay('middleMiddle')).toBe(true);
      expect(usesCarouselFullHeightContentOverlay('middleTop')).toBe(true);
      expect(usesCarouselFullHeightContentOverlay('startBottom')).toBe(false);
      expect(usesCarouselFullHeightContentOverlay('middleBottom')).toBe(false);
    });
  });

  describe('flexible slide height', () => {
    it('defaults to 480 and clamps invalid or sub-minimum values to 300', () => {
      expect(resolveCarouselFlexibleSlideHeight()).toBe(480);
      expect(resolveCarouselFlexibleSlideHeight(undefined)).toBe(480);
      expect(resolveCarouselFlexibleSlideHeight(250)).toBe(300);
      expect(resolveCarouselFlexibleSlideHeight(0)).toBe(300);
      expect(resolveCarouselFlexibleSlideHeight(-10)).toBe(300);
    });

    it('truncates decimals and accepts values at or above minimum', () => {
      expect(resolveCarouselFlexibleSlideHeight(500.9)).toBe(500);
      expect(resolveCarouselFlexibleSlideHeight(300.2)).toBe(300);
      expect(resolveCarouselFlexibleSlideHeight(360)).toBe(360);
    });

    it('prefers slide height over root height when flexible', () => {
      expect(resolveCarouselSlideHeight('flexible', 480, 360)).toBe(360);
      expect(resolveCarouselSlideHeight('flexible', 360)).toBe(360);
      expect(resolveCarouselSlideHeight('flexible')).toBe(480);
    });

    it('uses root height for fixed aspect ratios when slide height is omitted', () => {
      expect(resolveCarouselSlideHeight('16:9', 400)).toBe(400);
      expect(resolveCarouselSlideHeight('16:9')).toBeUndefined();
      expect(usesCarouselCustomSlideHeight('16:9', 400)).toBe(true);
      expect(usesCarouselCustomSlideHeight('3:4')).toBe(false);
    });
  });

  describe('image aspect ratio', () => {
    it('lists every Figma CarouselImage variant plus flexible', () => {
      expect(CAROUSEL_IMAGE_ASPECT_RATIOS).toEqual([
        '1:2',
        '9:16',
        '3:4',
        '1:1',
        '4:3',
        '5:3',
        '16:9',
        '2:1',
        '21:9',
        'flexible',
      ]);
    });

    it('resolves width/height ratios for Slide.Image media frame', () => {
      expect(resolveCarouselImageAspectRatio('1:2')).toBe(0.5);
      expect(resolveCarouselImageAspectRatio('5:3')).toBeCloseTo(5 / 3);
      expect(resolveCarouselImageAspectRatio('2:1')).toBe(2);
      expect(resolveCarouselImageAspectRatio('21:9')).toBeCloseTo(21 / 9);
    });

    it('returns undefined for flexible image frames', () => {
      expect(resolveCarouselImageAspectRatio('flexible')).toBeUndefined();
    });

    it('falls back to 3:4 ratio token for flexible image aspect helper', () => {
      expect(resolveCarouselImageAspectRatio(CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO)).toBe(0.75);
    });

    it('defaults native carousel image ratio to 3:4', () => {
      expect(CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO).toBe('3:4');
      expect(resolveCarouselImageAspectRatio(CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO)).toBe(0.75);
    });
  });

  describe('recipe', () => {
    it('defaults slide radius to Shape-3', () => {
      expect(resolveCarouselSlideRadius({}, shape)).toBe(shape['3']);
      expect(resolveCarouselSlideRadius({ slideShape: 'soft' }, shape)).toBe(shape['3']);
    });

    it('maps roomy and sharp slideShape recipe options', () => {
      expect(resolveCarouselSlideRadius({ slideShape: 'roomy' }, shape)).toBe(shape['4-5']);
      expect(resolveCarouselSlideRadius({ slideShape: 'sharp' }, shape)).toBe(0);
    });

    it('defaults content rhythm to balanced spacing tokens', () => {
      expect(resolveCarouselContentSpacing({})).toEqual({
        paddingTop: tokens.spacing['4'],
        paddingBottom: tokens.spacing['4'],
        paddingHorizontal: tokens.spacing['4'],
        contentGap: tokens.spacing['2'],
        contentOuterGap: tokens.spacing['3'],
        badgesToContentGap: tokens.spacing['3'],
        buttonGroupPaddingTop: tokens.spacing['2'],
        cornerPadding: tokens.spacing['3-5'],
        controlsPaddingVertical: 0,
      });
    });

    it('maps compact and spacious contentRhythm options', () => {
      expect(resolveCarouselContentSpacing({ contentRhythm: 'compact' }).paddingTop).toBe(
        tokens.spacing['4'],
      );
      expect(resolveCarouselContentSpacing({ contentRhythm: 'spacious' }).paddingBottom).toBe(
        tokens.spacing['8'],
      );
    });
  });

  describe('accessibility', () => {
    it('excludes the root container from the a11y tree so children stay reachable', () => {
      const props = getCarouselRootAccessibilityProps({ 'aria-label': 'Featured carousel' });
      expect(props.accessible).toBe(false);
      expect(props.importantForAccessibility).toBe('no');
    });

    it('announces the region name on an SR-only header node', () => {
      const name = getCarouselRootNameAccessibilityProps({ 'aria-label': 'Featured carousel' });
      expect(name?.accessible).toBe(true);
      expect(name?.accessibilityRole).toBe('header');
      expect(name?.accessibilityLabel).toBe('Featured carousel');
    });

    it('omits the region-name node when no aria-label is provided', () => {
      expect(getCarouselRootNameAccessibilityProps({})).toBeNull();
    });

    it('exposes umbrella getCarouselAccessibilityProps alias', () => {
      expect(getCarouselAccessibilityProps({ 'aria-label': 'Gallery' })?.accessibilityLabel).toBe(
        'Gallery',
      );
    });

    it('maps slide aria-label with empty fallback when Track did not inject', () => {
      expect(getCarouselSlideAccessibilityProps({ 'aria-label': '2 of 5' }).accessibilityLabel).toBe(
        '2 of 5',
      );
      expect(getCarouselSlideAccessibilityProps({}).accessibilityLabel).toBe('');
    });

    it('combines slide position with image alt for the image node label', () => {
      expect(
        getCarouselSlideAccessibilityProps({ 'aria-label': '2 of 5', alt: 'Bride at a celebration' })
          .accessibilityLabel,
      ).toBe('2 of 5, Bride at a celebration');
    });

    it('falls back to alt alone when position label is absent', () => {
      expect(
        getCarouselSlideAccessibilityProps({ alt: 'Shopkeeper on a phone call' }).accessibilityLabel,
      ).toBe('Shopkeeper on a phone call');
    });

    it('marks the slide image node as an accessible image element', () => {
      const props = getCarouselSlideAccessibilityProps({ 'aria-label': '1 of 3', alt: 'Hero' });
      expect(props.accessible).toBe(true);
      expect(props.accessibilityRole).toBe('image');
    });

    it('formats slide position labels for Track injection', () => {
      expect(formatCarouselSlidePosition(2, 5)).toBe('2 of 5');
    });

    it('silences track live region while autoplay is running', () => {
      expect(getCarouselTrackLiveRegionProps(true).accessibilityLiveRegion).toBe('none');
      expect(getCarouselTrackLiveRegionProps(false).accessibilityLiveRegion).toBe('polite');
    });
  });

  describe('controls layout', () => {
    it('centres controls when split layout has no nav buttons', () => {
      expect(resolveCarouselControlsLayout('split', false)).toBe('center');
      expect(resolveCarouselControlsLayout('split', true)).toBe('split');
    });

    it('defaults on-media pagination to middle and below to start', () => {
      expect(resolveCarouselPaginationAlign('onMedia', undefined)).toBe('middle');
      expect(resolveCarouselPaginationAlign('below', undefined)).toBe('start');
      expect(resolveCarouselPaginationAlign('onMedia', 'end')).toBe('end');
    });

    it('derives content inset from on-media chrome height and content padding', () => {
      const spacing = resolveCarouselContentSpacing({});
      expect(ON_MEDIA_CONTROLS_HEIGHT).toBe(tokens.spacing['10']);
      expect(resolveOnMediaControlsContentInset(spacing.paddingBottom)).toBe(tokens.spacing['6']);
      expect(spacing.paddingBottom + resolveOnMediaControlsContentInset(spacing.paddingBottom)).toBe(
        ON_MEDIA_CONTROLS_HEIGHT,
      );
    });
  });

  describe('controls parts', () => {
    it('detects presence of nav-arrow children', () => {
      tagCarouselControlPart(DemoNavButton, 'nav-prev');
      const children = [
        React.createElement('span', { key: 'dots' }, 'dots'),
        React.createElement(DemoNavButton, { key: 'prev' }),
        React.createElement(DemoNavButton, { key: 'next', carouselControlPart: 'nav-next' }),
      ];
      expect(hasNavArrowChild(children)).toBe(true);
      expect(hasNavArrowChild([React.createElement('span', { key: 'dots' }, 'dots')])).toBe(false);
    });

    it('detects nav buttons through wrapper props forwarding carouselControlPart', () => {
      function WrappedNav(props: { carouselControlPart?: 'nav-prev' }) {
        return React.createElement(DemoNavButton, props);
      }
      const child = React.createElement(WrappedNav, {
        carouselControlPart: 'nav-prev',
      });
      expect(resolveCarouselControlPart(WrappedNav, child.props)).toBe('nav-prev');
      expect(isCarouselNavArrowChild(child)).toBe(true);
    });

    it('detects on-media selection rail children', () => {
      tagCarouselControlPart(DemoSelectionRail, 'selection-rail');
      const children = [
        React.createElement('span', { key: 'dots' }, 'dots'),
        React.createElement(DemoSelectionRail, { key: 'rail', onMedia: true }),
      ];
      expect(hasOnMediaSelectionRailChild(children)).toBe(true);
      expect(
        hasOnMediaSelectionRailChild([
          React.createElement(DemoSelectionRail, { key: 'rail', onMedia: false }),
        ]),
      ).toBe(false);
    });

    it('detects below-media selection rail children', () => {
      tagCarouselControlPart(DemoSelectionRail, 'selection-rail');
      expect(
        hasBelowMediaSelectionRailChild([
          React.createElement(DemoSelectionRail, { key: 'rail', onMedia: false }),
        ]),
      ).toBe(true);
      expect(
        hasBelowMediaSelectionRailChild([
          React.createElement(DemoSelectionRail, { key: 'rail', onMedia: true }),
        ]),
      ).toBe(false);
    });

    it('renders selection rail after other on-media controls', () => {
      tagCarouselControlPart(DemoSelectionRail, 'selection-rail');
      const ordered = orderOnMediaControlChildren([
        React.createElement(DemoSelectionRail, { key: 'rail', onMedia: true }),
        React.createElement('span', { key: 'dots' }, 'dots'),
        React.createElement(DemoNavButton, { key: 'prev' }),
      ]);
      expect(React.isValidElement(ordered[2]) && ordered[2].type === DemoSelectionRail).toBe(
        true,
      );
    });
  });

  describe('slide scrim', () => {
    it('returns null when scrim is omitted or false', () => {
      expect(resolveCarouselSlideScrimProps(undefined)).toBeNull();
      expect(resolveCarouselSlideScrimProps(false)).toBeNull();
    });

    it('returns default props when scrim is true', () => {
      expect(resolveCarouselSlideScrimProps(true)).toEqual(CAROUSEL_SLIDE_SCRIM_PROPS);
    });

    it('passes through custom Scrim configuration', () => {
      expect(
        resolveCarouselSlideScrimProps({
          position: 'top',
          size: 'M',
          attention: 'low',
          variant: 'overlay',
        }),
      ).toEqual({
        position: 'top',
        size: 'M',
        attention: 'low',
        variant: 'overlay',
      });
    });
  });

  describe('selection rail', () => {
    it('maps onMedia to transparent surface and below-media to opaque', () => {
      expect(resolveCarouselSelectionRailSurface(true)).toBe('transparent');
      expect(resolveCarouselSelectionRailSurface(false)).toBe('opaque');
    });

    it('clamps on-media sizes to s/m/l', () => {
      expect(resolveCarouselSelectionRailSize('s', true)).toBe('s');
      expect(resolveCarouselSelectionRailSize('xl', true)).toBe('l');
      expect(resolveCarouselSelectionRailSize('2xl', true)).toBe('l');
    });

    it('allows xl and 2xl below media', () => {
      expect(resolveCarouselSelectionRailSize('xl', false)).toBe('xl');
      expect(resolveCarouselSelectionRailSize('2xl', false)).toBe('2xl');
    });

    it('maps Figma 2818:50672 rail item size m to spacing-18 (72px)', () => {
      expect(resolveCarouselSelectionRailItemSize('m')).toBe(tokens.spacing['18']);
    });

    it('reserves on-media rail height per Figma spacerOnMediaSelectionRail', () => {
      expect(ON_MEDIA_SELECTION_RAIL_HEIGHT).toBe(tokens.spacing['28']);
      expect(resolveOnMediaSelectionRailInset(true)).toBe(tokens.spacing['28']);
      expect(resolveOnMediaSelectionRailInset(false)).toBe(0);
    });

    it('insets on-media rail with margin; below-media uses peek align or margin', () => {
      expect(resolveCarouselSelectionRailPaddingHorizontal(true)).toBe(tokens.spacing.Margin);
      expect(resolveCarouselSelectionRailPaddingHorizontal(false)).toBe(tokens.spacing.Margin);
      expect(resolveCarouselSelectionRailPaddingHorizontal(false, 6)).toBe(6);
    });

    it('derives below-media peek align inset from viewport and slide width', () => {
      expect(
        resolveCarouselSelectionRailPeekAlignInset(false, 'both', 360, 328),
      ).toBe(16);
      expect(
        resolveCarouselSelectionRailPeekAlignInset(false, 'prev', 360, 344),
      ).toBe(PEEK_COLUMN_WIDTH);
      expect(
        resolveCarouselSelectionRailPeekAlignInset(false, 'next', 360, 344),
      ).toBe(0);
      expect(
        resolveCarouselSelectionRailPeekAlignInset(false, 'none', 360, 328),
      ).toBeUndefined();
      expect(
        resolveCarouselSelectionRailPeekAlignInset(true, 'both', 360, 328),
      ).toBeUndefined();
    });
  });

  describe('root layout', () => {
    it('uses grid margin column + gutter padding per Figma ItemPrev @ 360', () => {
      expect(PEEK_COLUMN_WIDTH).toBe(tokens.spacing.Margin);
      expect(PEEK_COLUMN_PADDING).toBe(tokens.spacing.Gutter);
      expect(PEEK_VISIBLE_WIDTH).toBe(tokens.spacing.Margin - tokens.spacing.Gutter);
      expect(PEEK_OFFSET).toBe(tokens.spacing.Margin * 2);
      expect(PEEK_INSET_PER_SIDE).toBe(tokens.spacing.Margin);
    });
  });

  describe('peek from fullWidth', () => {
    it('uses no peek when fullWidth is true and both sides when false', () => {
      expect(resolveCarouselPeek(true)).toBe('none');
      expect(resolveCarouselPeek(false)).toBe('both');
      expect(resolveCarouselPeek(undefined)).toBe('both');
    });
  });

  describe('peek layout', () => {
    it('reserves one margin column for prev/next peek and two for both', () => {
      expect(resolvePeekViewportInset('none')).toBe(0);
      expect(resolvePeekViewportInset('prev')).toBe(PEEK_COLUMN_WIDTH);
      expect(resolvePeekViewportInset('next')).toBe(PEEK_COLUMN_WIDTH);
      expect(resolvePeekViewportInset('both')).toBe(PEEK_OFFSET);
    });

    it('pads only the peek side on the track', () => {
      expect(resolveCarouselTrackContentStyle('prev')).toMatchObject({
        paddingLeft: PEEK_COLUMN_WIDTH,
        paddingRight: 0,
      });
      expect(resolveCarouselTrackContentStyle('next')).toMatchObject({
        paddingRight: PEEK_COLUMN_WIDTH,
        paddingLeft: 0,
      });
      expect(resolveCarouselTrackContentStyle('both')).toMatchObject({
        paddingHorizontal: PEEK_COLUMN_WIDTH,
      });
    });

    it('keeps track gap at Spacing-2 and adds horizontal padding when peek is on', () => {
      expect(SLIDE_GAP).toBe(tokens.spacing['2']);
      expect(resolveCarouselTrackContentStyle('both').gap).toBe(tokens.spacing['2']);
      expect(resolveCarouselTrackContentStyle('both').paddingHorizontal).toBe(
        PEEK_COLUMN_WIDTH,
      );
      expect(resolveCarouselTrackContentStyle('none').gap).toBe(tokens.spacing['2']);
    });

    it('derives snap offsets from slide stride (width + gap)', () => {
      expect(resolveCarouselSnapOffset(0, 328)).toBe(0);
      expect(resolveCarouselSnapOffset(2, 328)).toBe(656);
    });

    it('resolves root gap below pagination vs selection rail', () => {
      const paginationControls = React.createElement(
        DemoControls,
        { placement: 'below' },
        React.createElement('span', null, 'dots'),
      );
      expect(resolveCarouselRootBelowGap([paginationControls], DemoControls)).toBe(
        tokens.spacing['2'],
      );

      tagCarouselControlPart(DemoSelectionRail, 'selection-rail');
      const railControls = React.createElement(
        DemoControls,
        { placement: 'below' },
        React.createElement(DemoSelectionRail, { onMedia: false }),
      );
      expect(resolveCarouselRootBelowGap([railControls], DemoControls)).toBe(
        tokens.spacing['3'],
      );
    });
  });
});
