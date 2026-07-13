/**
 * Tooltip.native.tsx
 *
 * RN peer of `packages/ui/src/components/Tooltip/Tooltip.tsx`.
 * Static geometry in `./Tooltip.styles.native.ts`; brand paint inline via
 * `useSurfaceTokens('neutral')` (web: `--Surface-Bold` / `--Text-OnBold-High`
 * legacy aliases resolve from the neutral role in `generateMultiRoleRootCSS`).
 *
 * Popup is a trigger-relative sibling (`position: 'absolute'` inside
 * `styles.anchor`). Placement uses `measureLayout(trigger → anchor)` so
 * coordinates stay in one local space — no root Modal / measureInWindow.
 */

import React, {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Easing,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type TargetedEvent,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@oneui/tokens';
import {
  useComponentRecipe,
  useElevation,
  useMotion,
  useOneUITheme,
  useReduceMotion,
  useSurfaceTokens,
  useTypographyTokens,
  resolveShapeBorderRadius,
  type NativeShape,
} from '../../theme';
import {
  computeTooltipPopupPosition,
  getTooltipPopupAccessibilityProps,
  getTooltipTriggerChildAccessibilityProps,
  getTooltipTriggerWrapperAccessibilityProps,
  getTooltipAnchorAccessibilityProps,
  resolveTooltipEntranceOffset,
  useTooltipState,
  type TooltipLayoutRect,
  type TooltipPopupPosition,
  type TooltipProps,
  type TooltipProviderProps,
  type TooltipSide,
} from './interface';
import {
  ARROW_CORNER_INSET,
  ARROW_EDGE_OVERLAP,
  ARROW_HEIGHT_HORIZONTAL,
  ARROW_HEIGHT_VERTICAL,
  ARROW_PROTRUSION,
  ARROW_WIDTH_HORIZONTAL,
  ARROW_WIDTH_VERTICAL,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_SIDE_OFFSET,
  ENTRANCE_SLIDE_DISTANCE,
  POPUP_PADDING_DENSITY,
  styles,
} from './Tooltip.styles.native';

const FIGMA_TIP_PATH =
  'M7.18173 5.15746L4.3897 2.03407C3.22548 0.731678 1.64646 0 0 0H18C16.3535 0 14.7745 0.731676 13.6103 2.03407L10.8183 5.15746C9.81407 6.28085 8.18593 6.28085 7.18173 5.15746Z';

interface TooltipDelayContextValue {
  delay?: number;
  closeDelay?: number;
}

const TooltipDelayContext = createContext<TooltipDelayContextValue>({});

export function TooltipProvider({
  children,
  delay,
  closeDelay,
}: TooltipProviderProps): React.ReactElement {
  const value = useMemo(() => ({ delay, closeDelay }), [delay, closeDelay]);
  return <TooltipDelayContext.Provider value={value}>{children}</TooltipDelayContext.Provider>;
}

function resolveTooltipBorderRadius(decisions: Record<string, string>, shape: NativeShape): number {
  switch (decisions.cornerRadius) {
    case 'sharp':
      return shape['0'];
    case 'soft':
      return shape['2'];
    case 'pill':
      return shape.Pill;
    case 'default':
    default:
      return resolveShapeBorderRadius('Shape-1-5', shape) ?? DEFAULT_BORDER_RADIUS;
  }
}

function mergeHandler<T extends (...args: never[]) => void>(ours?: T, theirs?: T): T | undefined {
  if (!ours && !theirs) return theirs ?? ours;
  if (!theirs) return ours;
  if (!ours) return theirs;
  return ((...args: Parameters<T>) => {
    theirs(...args);
    ours(...args);
  }) as T;
}

function arrowAnchorStyle(side: TooltipSide, align: 'start' | 'center' | 'end'): ViewStyle {
  const inset = ARROW_CORNER_INSET;
  const isVertical = side === 'top' || side === 'bottom';

  if (align === 'start') {
    return isVertical
      ? { left: inset, right: undefined, top: undefined, bottom: undefined }
      : { top: inset, bottom: undefined, left: undefined, right: undefined };
  }
  if (align === 'end') {
    return isVertical
      ? { right: inset, left: undefined, top: undefined, bottom: undefined }
      : { bottom: inset, top: undefined, left: undefined, right: undefined };
  }

  if (isVertical) {
    return { left: 0, right: 0, alignItems: 'center' };
  }
  return {
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: side === 'right' ? 'flex-end' : 'flex-start',
  };
}

function arrowEdgeStyle(side: TooltipSide): ViewStyle {
  const edge = ARROW_PROTRUSION - ARROW_EDGE_OVERLAP;
  switch (side) {
    case 'top':
      return { bottom: -edge };
    case 'bottom':
      return { top: -edge };
    case 'left':
      return { right: -edge };
    case 'right':
      return { left: -edge };
  }
}

function TooltipArrow({
  side,
  align,
  fill,
}: {
  side: TooltipSide;
  align: 'start' | 'center' | 'end';
  fill: string;
}): React.ReactElement {
  const hostStyle = [styles.arrowHost, arrowAnchorStyle(side, align), arrowEdgeStyle(side)];

  if (side === 'top') {
    return (
      <View style={hostStyle}>
        <Svg width={ARROW_WIDTH_HORIZONTAL} height={ARROW_HEIGHT_HORIZONTAL} viewBox="0 0 18 6">
          <Path d={FIGMA_TIP_PATH} fill={fill} />
        </Svg>
      </View>
    );
  }
  if (side === 'bottom') {
    return (
      <View style={hostStyle}>
        <Svg width={ARROW_WIDTH_HORIZONTAL} height={ARROW_HEIGHT_HORIZONTAL} viewBox="0 0 18 6">
          <Path d={FIGMA_TIP_PATH} fill={fill} transform="rotate(180 9 3)" />
        </Svg>
      </View>
    );
  }
  if (side === 'left') {
    return (
      <View style={hostStyle}>
        <Svg width={ARROW_WIDTH_VERTICAL} height={ARROW_HEIGHT_VERTICAL} viewBox="0 0 6 18">
          <Path d={FIGMA_TIP_PATH} fill={fill} transform="translate(0 18) rotate(-90)" />
        </Svg>
      </View>
    );
  }
  return (
    <View style={hostStyle}>
      <Svg width={ARROW_WIDTH_VERTICAL} height={ARROW_HEIGHT_VERTICAL} viewBox="0 0 6 18">
        <Path d={FIGMA_TIP_PATH} fill={fill} transform="translate(6 0) rotate(90)" />
      </Svg>
    </View>
  );
}

function renderTooltipContent(content: ReactNode, textStyle: TextStyle): ReactNode {
  if (typeof content === 'string' || typeof content === 'number') {
    return (
      <Text style={textStyle} numberOfLines={undefined}>
        {content}
      </Text>
    );
  }
  return content;
}

export function Tooltip(props: TooltipProps): React.ReactElement {
  const provider = useContext(TooltipDelayContext);
  const state = useTooltipState(props, provider.delay, provider.closeDelay);
  const role = useSurfaceTokens('neutral');
  const { shape } = useOneUITheme();
  const elevation = useElevation();
  const motion = useMotion();
  const reduceMotion = useReduceMotion();
  const recipeDecisions = useComponentRecipe('tooltip');
  const bodyTypo = useTypographyTokens('body', 'S', { emphasis: 'medium' });

  const {
    children,
    content,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    zIndex: zIndexProp,
    subtle: subtleProp,
    testID,
    minWidth: minWidthProp,
    popupPointerEvents: popupPointerEventsProp,
  } = props;

  const { trigger, arrow, disabled } = state;

  const subtle = subtleProp || reduceMotion;
  const sideOffset = state.sideOffset ?? DEFAULT_SIDE_OFFSET;
  const borderRadius = resolveTooltipBorderRadius(recipeDecisions, shape);
  const densityKey = (recipeDecisions.density as 'tight' | 'roomy' | undefined) ?? 'default';
  const paddingStyle =
    densityKey === 'tight' || densityKey === 'roomy'
      ? POPUP_PADDING_DENSITY[densityKey]
      : POPUP_PADDING_DENSITY.default;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? Boolean(openProp) : internalOpen;

  const [popupSize, setPopupSize] = useState<{ width: number; height: number } | null>(null);
  const [popupPosition, setPopupPosition] = useState<TooltipPopupPosition | null>(null);
  const [needsMeasure, setNeedsMeasure] = useState(defaultOpen);

  const anchorRef = useRef<View>(null);
  const triggerRef = useRef<View>(null);
  const placementTriggerRectRef = useRef<TooltipLayoutRect | null>(null);
  const placementCompleteRef = useRef(false);
  const [placementTick, setPlacementTick] = useState(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const paint = useMemo(
    () => ({
      bg: role.surfaces.bold,
      text: role.onBoldContent.high,
    }),
    [role]
  );

  const elevationStyle = elevation.byLevel[2]?.ios ?? {};
  const androidElevation = elevation.byLevel[2]?.androidElevation ?? tokens.spacing['0'];

  const resetPlacement = useCallback(() => {
    placementTriggerRectRef.current = null;
    placementCompleteRef.current = false;
    setPopupPosition(null);
    setPopupSize(null);
    setNeedsMeasure(false);
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (!next) {
        resetPlacement();
      }
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [disabled, isControlled, onOpenChange, resetPlacement]
  );

  const clearTimers = useCallback(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const captureTriggerRect = useCallback((onCaptured?: () => void) => {
    const anchor = anchorRef.current;
    const triggerEl = triggerRef.current;
    if (!anchor || !triggerEl) return;
    triggerEl.measureLayout(
      anchor,
      (x, y, width, height) => {
        if (width <= 0 || height <= 0) return;
        const rect = { x, y, width, height };
        placementTriggerRectRef.current = rect;
        onCaptured?.();
      },
      () => {
        /* measureLayout failed — keep previous rect */
      }
    );
  }, []);

  const syncTriggerRect = useCallback(() => {
    if (isOpen) return;
    captureTriggerRect();
  }, [captureTriggerRect, isOpen]);

  const handleTriggerLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      syncTriggerRect();
    },
    [syncTriggerRect]
  );

  const beginOpen = useCallback(() => {
    placementTriggerRectRef.current = null;
    placementCompleteRef.current = false;
    setPopupSize(null);
    setPopupPosition(null);
    setNeedsMeasure(true);
    setOpen(true);
    requestAnimationFrame(() => {
      captureTriggerRect(() => {
        setPlacementTick((tick) => tick + 1);
      });
    });
  }, [captureTriggerRect, setOpen]);

  const scheduleShow = useCallback(() => {
    if (disabled || trigger === 'manual') return;
    clearTimers();
    showTimer.current = setTimeout(() => {
      showTimer.current = null;
      beginOpen();
    }, state.delay);
  }, [beginOpen, clearTimers, disabled, state.delay, trigger]);

  const scheduleHide = useCallback(() => {
    if (trigger === 'manual') return;
    clearTimers();
    const wait = state.closeDelay ?? 0;
    hideTimer.current = setTimeout(() => setOpen(false), wait);
  }, [clearTimers, setOpen, state.closeDelay, trigger]);

  const handlePressIn = useCallback(() => {
    if (disabled || trigger !== 'hover') return;
    scheduleShow();
  }, [disabled, scheduleShow, trigger]);

  const handlePressOut = useCallback(() => {
    if (disabled || trigger !== 'hover') return;
    scheduleHide();
  }, [disabled, scheduleHide, trigger]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (trigger === 'click') {
      if (isOpen) {
        clearTimers();
        setOpen(false);
        return;
      }
      if (showTimer.current) {
        clearTimers();
        return;
      }
      scheduleShow();
    }
  }, [clearTimers, disabled, isOpen, scheduleShow, setOpen, trigger]);

  const handleFocus = useCallback(
    (_event: NativeSyntheticEvent<TargetedEvent>) => {
      if (disabled || trigger !== 'focus') return;
      beginOpen();
    },
    [beginOpen, disabled, trigger]
  );

  const handleBlur = useCallback(
    (_event: NativeSyntheticEvent<TargetedEvent>) => {
      if (disabled || trigger !== 'focus') return;
      setOpen(false);
    },
    [disabled, setOpen, trigger]
  );

  const dismiss = useCallback(() => {
    if (isOpen && trigger !== 'manual') setOpen(false);
  }, [isOpen, setOpen, trigger]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!isOpen || trigger === 'hover' || trigger === 'manual') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      dismiss();
      return true;
    });
    return () => sub.remove();
  }, [dismiss, isOpen, trigger]);

  useEffect(() => {
    if (!defaultOpen) return;
    placementTriggerRectRef.current = null;
    placementCompleteRef.current = false;
    setNeedsMeasure(true);
    requestAnimationFrame(() => {
      captureTriggerRect(() => {
        setPlacementTick((tick) => tick + 1);
      });
    });
  }, [captureTriggerRect, defaultOpen]);

  useEffect(() => {
    if (!isOpen || !popupSize || !placementTriggerRectRef.current || placementCompleteRef.current) {
      return;
    }
    setPopupPosition(
      computeTooltipPopupPosition(
        placementTriggerRectRef.current,
        popupSize,
        state.side,
        state.align,
        sideOffset,
        arrow ? ARROW_PROTRUSION : tokens.spacing['0']
      )
    );
    placementCompleteRef.current = true;
    setNeedsMeasure(false);
  }, [
    arrow,
    isOpen,
    placementTick,
    popupSize,
    sideOffset,
    state.align,
    state.side,
  ]);

  useEffect(() => {
    if (state.contentLabel && isOpen) {
      AccessibilityInfo.announceForAccessibility(state.contentLabel);
    }
  }, [isOpen, state.contentLabel]);

  const popupReady = isOpen && popupPosition != null && !needsMeasure;

  const entrance = resolveTooltipEntranceOffset(state.side, ENTRANCE_SLIDE_DISTANCE, subtle);
  const motionDuration = subtle ? motion.duration.subtle.m : motion.duration.moderate.m;
  const exitDuration = subtle ? motion.duration.subtle.s : motion.duration.moderate.s;
  const entranceEasingBezier = subtle
    ? motion.easings.entrance.subtle.bezier
    : motion.easings.entrance.moderate.bezier;
  const exitEasingBezier = subtle
    ? motion.easings.exit.subtle.bezier
    : motion.easings.exit.moderate.bezier;
  const entranceEasing =
    entranceEasingBezier != null
      ? Easing.bezier(
          entranceEasingBezier[0],
          entranceEasingBezier[1],
          entranceEasingBezier[2],
          entranceEasingBezier[3]
        )
      : Easing.out(Easing.cubic);
  const exitEasing =
    exitEasingBezier != null
      ? Easing.bezier(
          exitEasingBezier[0],
          exitEasingBezier[1],
          exitEasingBezier[2],
          exitEasingBezier[3]
        )
      : Easing.in(Easing.cubic);

  useEffect(() => {
    if (!popupReady) return;
    translateX.setValue(entrance.x);
    translateY.setValue(entrance.y);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motionDuration,
        easing: entranceEasing,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: motionDuration,
        easing: entranceEasing,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motionDuration,
        easing: entranceEasing,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    entrance.x,
    entrance.y,
    entranceEasing,
    motionDuration,
    opacity,
    popupReady,
    translateX,
    translateY,
  ]);

  useEffect(() => {
    if (isOpen) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: exitDuration,
        easing: exitEasing,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: entrance.x,
        duration: exitDuration,
        easing: exitEasing,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: entrance.y,
        duration: exitDuration,
        easing: exitEasing,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entrance.x, entrance.y, exitDuration, exitEasing, isOpen, opacity, translateX, translateY]);

  const triggerWrapperA11y = getTooltipTriggerWrapperAccessibilityProps();

  const popupA11y = getTooltipPopupAccessibilityProps({
    contentLabel: state.contentLabel,
    isOpen,
  });

  const textStyle = {
    fontSize: bodyTypo.fontSize,
    lineHeight: bodyTypo.lineHeight,
    fontWeight: bodyTypo.fontWeight,
    fontFamily: bodyTypo.fontFamily,
    color: paint.text,
    ...(state.multiline ? styles.popupText : styles.popupTextNowrap),
  };

  const popupPointerEvents = !popupReady ? 'none' : (popupPointerEventsProp ?? 'auto');

  const popupFrameStyle: ViewStyle = {
    backgroundColor: paint.bg,
    borderRadius,
    ...paddingStyle,
    ...(state.maxWidth != null ? { maxWidth: state.maxWidth } : null),
    ...elevationStyle,
    elevation: androidElevation,
    zIndex: zIndexProp ?? tokens.zIndex.tooltip,
  };

  const handlePopupLayout = useCallback((event: LayoutChangeEvent) => {
    if (placementCompleteRef.current) return;
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setPopupSize((prev) => {
      if (prev?.width === width && prev?.height === height) return prev;
      return { width, height };
    });
  }, []);

  const popupContent = (
    <>
      {arrow ? <TooltipArrow side={state.side} align={state.align} fill={paint.bg} /> : null}
      {renderTooltipContent(content, textStyle)}
    </>
  );

  const triggerChildA11yState = {
    disabled: state.disabled,
    contentLabel: state.contentLabel,
    isOpen,
  };

  let enhancedChild: ReactNode = children;
  if (isValidElement(children)) {
    const child = children as ReactElement<{
      onPress?: () => void;
      onPressIn?: () => void;
      onPressOut?: () => void;
      onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
      onBlur?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
      accessible?: boolean;
      importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
      'aria-label'?: string;
      accessibilityLabel?: string;
      accessibilityHint?: string;
      accessibilityState?: { disabled?: boolean; expanded?: boolean };
    }>;
    const childA11y = getTooltipTriggerChildAccessibilityProps(props, triggerChildA11yState, child.props);
    enhancedChild = cloneElement(child, {
      onPress: mergeHandler(handlePress, child.props.onPress),
      onPressIn: mergeHandler(handlePressIn, child.props.onPressIn),
      onPressOut: mergeHandler(handlePressOut, child.props.onPressOut),
      onFocus: mergeHandler(handleFocus, child.props.onFocus),
      onBlur: mergeHandler(handleBlur, child.props.onBlur),
      ...childA11y,
      accessibilityState: {
        ...child.props.accessibilityState,
        ...childA11y.accessibilityState,
      },
    });
  } else if (trigger !== 'manual') {
    const childA11y = getTooltipTriggerChildAccessibilityProps(props, triggerChildA11yState);
    enhancedChild = (
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        {...childA11y}
      >
        {children}
      </Pressable>
    );
  }

  const popupNode =
    isOpen || needsMeasure ? (
      <Animated.View
        style={[
          styles.popup,
          ...(minWidthProp != null ? [{ minWidth: minWidthProp }] : []),
          popupPosition != null
            ? { top: popupPosition.top, left: popupPosition.left }
            : { top: tokens.spacing['0'], left: tokens.spacing['0'] },
          !popupReady ? styles.popupMeasuring : null,
          popupReady
            ? {
                opacity,
                transform: [{ translateX }, { translateY }],
                zIndex: zIndexProp ?? tokens.zIndex.tooltip,
              }
            : null,
        ]}
        {...popupA11y}
        testID={testID ? `${testID}-popup` : undefined}
        pointerEvents={popupPointerEvents}
      >
        <View onLayout={handlePopupLayout} style={[styles.popupBody, popupFrameStyle]}>
          {popupContent}
        </View>
      </Animated.View>
    ) : null;

  return (
    <View
      ref={anchorRef}
      style={styles.anchor}
      collapsable={false}
      {...getTooltipAnchorAccessibilityProps()}
    >
      <View
        ref={triggerRef}
        collapsable={false}
        style={styles.triggerWrap}
        pointerEvents="box-none"
        onLayout={handleTriggerLayout}
        {...triggerWrapperA11y}
      >
        {enhancedChild}
      </View>
      {popupNode}
    </View>
  );
}

export type { TooltipProps, TooltipProviderProps } from './interface';
export {
  parsePosition,
  useTooltipState,
  getTooltipAccessibilityProps,
  getTooltipTriggerAccessibilityProps,
  getTooltipTriggerChildAccessibilityProps,
  getTooltipTriggerWrapperAccessibilityProps,
  getTooltipAnchorAccessibilityProps,
  getTooltipPopupAccessibilityProps,
} from './interface';
