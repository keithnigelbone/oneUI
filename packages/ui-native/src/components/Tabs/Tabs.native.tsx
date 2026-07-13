/**
 * Tabs.native.tsx — RN peer of packages/ui/src/components/Tabs/
 *
 * Compound API: Tabs.Root / Tabs.List / Tabs.Item / Tabs.Panel / Tabs.Indicator
 * Flat API: TabGroup, TabItem, TabPanel
 */

import React, {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type View as RNView,
} from 'react-native';
import { tokens } from '@oneui/tokens';
import {
  useMotion,
  useSurfaceTokens,
  useTypographyTokens,
  typographyToTextStyle,
  type NativeRoleTokens,
} from '../../theme';
import { TabsContext } from './TabsContext';
import {
  TabsSelectionContext,
  type TabContentLayout,
  type TabsSelectionContextValue,
} from './TabsSelectionContext';
import {
  getTabItemAccessibilityProps,
  getTabPanelAccessibilityProps,
  getTabsAccessibilityProps,
  useTabGroupState,
  useTabItemState,
  type TabGroupProps,
  type TabListProps,
  type TabPanelProps,
  type TabProps,
  type TabsProps,
  type TabsSize,
  type TabsValue,
} from './interface';
import {
  DISABLED_OPACITY,
  INDICATOR_RADIUS,
  INDICATOR_THICKNESS,
  PANEL_PADDING,
  VERTICAL_INDICATOR_HEIGHT,
  resolveTabItemLayout,
  stateLayerStyle,
  styles,
  tabPressableStyle,
} from './Tabs.styles.native';
import {
  resolveTabsHorizontalScrollOffset,
  resolveTabsVerticalScrollOffset,
  shouldEnableTabsAxisScroll,
} from './tabsListScroll.native';

/* ===== Tab panel marker for TabGroup child splitting ===== */

const TAB_PANEL_MARKER = Symbol.for('oneui.TabPanel');

function markTabPanel<T>(component: T): T {
  (component as { [TAB_PANEL_MARKER]?: boolean })[TAB_PANEL_MARKER] = true;
  return component;
}

function isTabPanelChild(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  return (node.type as { [TAB_PANEL_MARKER]?: boolean })[TAB_PANEL_MARKER] === true;
}

/* ===== Paint helpers ===== */

function tabColours(
  role: NativeRoleTokens,
  neutral: NativeRoleTokens,
  isSelected: boolean,
  isHovered: boolean
): { label: string; indicator: string } {
  if (isSelected) {
    return {
      label: role.content.tintedA11y,
      indicator: role.content.tinted,
    };
  }
  if (isHovered) {
    return { label: neutral.content.low, indicator: role.content.tinted };
  }
  return { label: role.content.high, indicator: role.content.tinted };
}

function disabledLabelColour(role: NativeRoleTokens): string {
  return role.content.low;
}

/* ===== Selection provider ===== */

function TabsSelectionProvider({
  children,
  currentValue,
  selectValue,
}: {
  children: ReactNode;
  currentValue: TabsValue;
  selectValue: (next: string | number) => void;
}): React.ReactElement {
  const listRef = useRef<RNView | null>(null);
  const layoutsRef = useRef<Map<string, TabContentLayout>>(new Map());

  const registerTabLayout = useCallback((tabValue: string | number, layout: TabContentLayout) => {
    layoutsRef.current.set(String(tabValue), layout);
  }, []);

  const unregisterTabLayout = useCallback((tabValue: string | number) => {
    layoutsRef.current.delete(String(tabValue));
  }, []);

  const getTabLayout = useCallback((tabValue: string | number) => {
    return layoutsRef.current.get(String(tabValue));
  }, []);

  const contextValue = useMemo(
    (): TabsSelectionContextValue => ({
      value: currentValue,
      selectValue,
      listRef,
      registerTabLayout,
      unregisterTabLayout,
      getTabLayout,
    }),
    [currentValue, getTabLayout, registerTabLayout, selectValue, unregisterTabLayout]
  );

  return (
    <TabsSelectionContext.Provider value={contextValue}>{children}</TabsSelectionContext.Provider>
  );
}

/* ===== Indicator ===== */

function TabsIndicator({
  size = 'm',
  orientation = 'horizontal',
  appearanceRole,
}: {
  size?: TabsSize;
  orientation?: 'horizontal' | 'vertical';
  appearanceRole: NativeRoleTokens;
}): React.ReactElement | null {
  const selection = React.useContext(TabsSelectionContext);
  const motion = useMotion();
  const animatedLeft = useRef(new Animated.Value(0)).current;
  const animatedTop = useRef(new Animated.Value(0)).current;
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const animatedHeight = useRef(new Animated.Value(INDICATOR_THICKNESS)).current;

  const activeValue = selection?.value;
  const duration = motion.duration.moderate.m;

  useEffect(() => {
    if (!selection || activeValue === null || activeValue === undefined) return;
    const layout = selection.getTabLayout(activeValue);
    if (!layout) return;

    if (orientation === 'horizontal') {
      Animated.parallel([
        Animated.timing(animatedLeft, {
          toValue: layout.x,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(animatedWidth, {
          toValue: layout.width,
          duration,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      const indicatorHeight = VERTICAL_INDICATOR_HEIGHT[size];
      const top = layout.y + (layout.height - indicatorHeight) / 2;
      Animated.parallel([
        Animated.timing(animatedTop, {
          toValue: top,
          duration,
          useNativeDriver: false,
        }),
        Animated.timing(animatedHeight, {
          toValue: indicatorHeight,
          duration,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [
    activeValue,
    animatedHeight,
    animatedLeft,
    animatedTop,
    animatedWidth,
    duration,
    orientation,
    selection,
    size,
  ]);

  if (activeValue === null || activeValue === undefined) return null;

  if (orientation === 'horizontal') {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            left: animatedLeft,
            bottom: 0,
            width: animatedWidth,
            height: INDICATOR_THICKNESS,
            backgroundColor: appearanceRole.content.tinted,
            borderRadius: INDICATOR_RADIUS,
          },
        ]}
      />
    );
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.indicator,
        {
          left: 0,
          top: animatedTop,
          width: INDICATOR_THICKNESS,
          height: animatedHeight,
          backgroundColor: appearanceRole.content.tinted,
          borderRadius: INDICATOR_RADIUS,
        },
      ]}
    />
  );
}

/* ===== Tab item ===== */

function TabsItem(props: TabProps): React.ReactElement {
  const {
    children,
    value,
    disabled,
    icon,
    badge,
    start: startProp,
    end: endProp,
    'data-force-state': forceState,
    style: styleProp,
    testID,
    onPress,
    onClick,
  } = props;

  const state = useTabItemState(props);
  const selection = React.useContext(TabsSelectionContext);
  const role = useSurfaceTokens(state.resolvedAppearance);
  const neutral = useSurfaceTokens('neutral');
  const metrics = resolveTabItemLayout(state.resolvedSize, state.resolvedOrientation);
  const labelTypo = useTypographyTokens('label', metrics.labelSize, {
    emphasis: state.isSelected ? 'high' : 'medium',
  });
  const labelStyle = typographyToTextStyle(labelTypo);
  const contentRef = useRef<RNView | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const startContent = startProp ?? icon;
  const endContent = endProp ?? badge;
  const hasLabel = Boolean(children);
  const isIconOnly = !hasLabel && Boolean(startContent) && !endContent;

  if (process.env.NODE_ENV !== 'production' && isIconOnly && !props['aria-label']) {
    // eslint-disable-next-line no-console
    console.warn('TabItem: icon-only tabs require an `aria-label` prop for accessibility.');
  }

  const colours = tabColours(role, neutral, state.isSelected, isHovered);
  const a11y = getTabItemAccessibilityProps(props, state);

  const measureContent = useCallback(() => {
    if (!selection?.listRef?.current || !contentRef.current) return;
    contentRef.current.measureLayout(
      selection.listRef.current as RNView,
      (x, y, width, height) => {
        selection.registerTabLayout(value, { x, y, width, height });
      },
      () => {}
    );
  }, [selection, value]);

  useEffect(() => {
    measureContent();
    return () => {
      selection?.unregisterTabLayout(value);
    };
  }, [measureContent, selection, value]);

  const handleLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      measureContent();
    },
    [measureContent]
  );

  const handlePress = useCallback(() => {
    if (state.isDisabled) return;
    onPress?.();
    onClick?.();
    selection?.selectValue(value);
  }, [onClick, onPress, selection, state.isDisabled, value]);

  const textColour = state.isDisabled ? disabledLabelColour(role) : colours.label;

  return (
    <Pressable
      accessible={a11y.accessible}
      accessibilityRole={a11y.accessibilityRole}
      accessibilityLabel={a11y.accessibilityLabel}
      accessibilityHint={a11y.accessibilityHint}
      accessibilityState={a11y.accessibilityState}
      disabled={state.isDisabled}
      onPress={handlePress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      testID={testID}
      style={({ pressed }) => [
        tabPressableStyle(state.resolvedOrientation, metrics.tabHeight),
        {
          opacity: state.isDisabled ? DISABLED_OPACITY : 1,
        },
        styleProp,
      ]}
    >
      <View
        style={[
          stateLayerStyle(metrics, state.resolvedOrientation),
          forceState === 'focus'
            ? {
                borderWidth: tokens.borderWidth.thin,
                borderColor: role.content.tintedA11y,
              }
            : null,
        ]}
      >
        <View
          ref={contentRef}
          onLayout={handleLayout}
          style={[styles.contentWrapper, { gap: metrics.slotGap }]}
        >
          {startContent ? (
            <View
              style={styles.slotStart}
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              {startContent}
            </View>
          ) : null}
          {hasLabel ? (
            <Text style={[styles.label, labelStyle, { color: textColour }]} numberOfLines={1}>
              {children}
            </Text>
          ) : null}
          {endContent ? (
            <View
              style={styles.slotEnd}
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              {endContent}
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

/* ===== Tab panel ===== */

function TabsPanel(props: TabPanelProps): React.ReactElement | null {
  const { children, value, style: styleProp, testID } = props;
  const selection = React.useContext(TabsSelectionContext);
  const isVisible =
    selection?.value !== null && selection?.value !== undefined && selection.value === value;
  const a11y = getTabPanelAccessibilityProps(props, { isVisible });

  if (!isVisible) return null;

  return (
    <View
      accessible={a11y.accessible}
      accessibilityRole={a11y.accessibilityRole}
      importantForAccessibility={a11y.importantForAccessibility}
      style={[styles.panel, { padding: PANEL_PADDING }, styleProp]}
      testID={testID}
    >
      {children}
    </View>
  );
}

markTabPanel(TabsPanel);

/* ===== Tab list ===== */

function TabsList({
  children,
  size: _size = 'm',
  orientation = 'horizontal',
  appearanceRole: _appearanceRole,
  style: styleProp,
  testID,
  ...a11yProps
}: TabListProps & {
  size?: TabsSize;
  orientation?: 'horizontal' | 'vertical';
  appearanceRole: NativeRoleTokens;
}): React.ReactElement {
  const selection = React.useContext(TabsSelectionContext);
  const a11y = getTabsAccessibilityProps(a11yProps);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef(0);
  const [viewportSize, setViewportSize] = useState(0);
  const [contentSize, setContentSize] = useState(0);

  const isHorizontal = orientation === 'horizontal';
  const scrollEnabled = shouldEnableTabsAxisScroll(contentSize, viewportSize);

  const scrollActiveTabIntoView = useCallback(
    (animated: boolean) => {
      if (!selection?.value || viewportSize <= 0) return;
      const layout = selection.getTabLayout(selection.value);
      if (!layout) return;
      const nextOffset = isHorizontal
        ? resolveTabsHorizontalScrollOffset(layout, viewportSize, scrollOffsetRef.current)
        : resolveTabsVerticalScrollOffset(layout, viewportSize, scrollOffsetRef.current);
      if (nextOffset === null) return;
      scrollRef.current?.scrollTo(
        isHorizontal ? { x: nextOffset, animated } : { y: nextOffset, animated }
      );
    },
    [isHorizontal, selection, viewportSize]
  );

  useEffect(() => {
    scrollActiveTabIntoView(true);
  }, [scrollActiveTabIntoView, selection?.value, contentSize]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset;
      scrollOffsetRef.current = isHorizontal ? offset.x : offset.y;
    },
    [isHorizontal]
  );

  const handleViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setViewportSize(isHorizontal ? width : height);
    },
    [isHorizontal]
  );

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      setContentSize(isHorizontal ? width : height);
    },
    [isHorizontal]
  );

  const listBody = (
    <View
      ref={selection?.listRef as React.RefObject<RNView>}
      accessible={a11y.accessible}
      accessibilityRole={a11y.accessibilityRole}
      accessibilityLabel={a11y.accessibilityLabel}
      accessibilityHint={a11y.accessibilityHint}
      style={[styles.list, orientation === 'vertical' ? styles.listVertical : null, styleProp]}
      testID={testID}
    >
      {children}
    </View>
  );

  return (
    <ScrollView
      ref={scrollRef}
      horizontal={isHorizontal}
      scrollEnabled={scrollEnabled}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      onLayout={handleViewportLayout}
      onContentSizeChange={handleContentSizeChange}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      style={isHorizontal ? styles.listScrollViewport : styles.listScrollViewportVertical}
    >
      {listBody}
    </ScrollView>
  );
}

/* ===== Root ===== */

function TabsRoot(props: TabsProps): React.ReactElement {
  const { children, style: styleProp, testID } = props;
  const { currentValue, selectValue, contextValue, orientation } = useTabGroupState(props);

  return (
    <TabsContext.Provider value={contextValue}>
      <TabsSelectionProvider currentValue={currentValue} selectValue={selectValue}>
        <View
          style={[styles.root, orientation === 'vertical' ? styles.rootVertical : null, styleProp]}
          testID={testID}
        >
          {children}
        </View>
      </TabsSelectionProvider>
    </TabsContext.Provider>
  );
}

/* ===== Flat TabGroup ===== */

export function TabGroup(props: TabGroupProps): React.ReactElement {
  const {
    children,
    showIndicator = true,
    activateOnFocus: _activateOnFocus,
    loopFocus: _loopFocus,
    style: styleProp,
    testID,
    ...rest
  } = props;

  const { currentValue, selectValue, contextValue, orientation, size, resolvedAppearance } =
    useTabGroupState(props);
  const appearanceRole = useSurfaceTokens(resolvedAppearance);

  const { items, panels } = useMemo(() => {
    const itemNodes: ReactNode[] = [];
    const panelNodes: ReactNode[] = [];
    Children.forEach(children, (child) => {
      if (isTabPanelChild(child)) {
        panelNodes.push(child);
      } else {
        itemNodes.push(child);
      }
    });
    return { items: itemNodes, panels: panelNodes };
  }, [children]);

  return (
    <TabsContext.Provider value={contextValue}>
      <TabsSelectionProvider currentValue={currentValue} selectValue={selectValue}>
        <View
          style={[styles.root, orientation === 'vertical' ? styles.rootVertical : null, styleProp]}
          testID={testID}
        >
          <TabsList size={size} orientation={orientation} appearanceRole={appearanceRole} {...rest}>
            {items}
            {showIndicator ? (
              <TabsIndicator
                size={size}
                orientation={orientation}
                appearanceRole={appearanceRole}
              />
            ) : null}
          </TabsList>
          {panels}
        </View>
      </TabsSelectionProvider>
    </TabsContext.Provider>
  );
}

/* ===== Namespace export ===== */

export const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  List: function TabsListCompound(listProps: TabListProps): React.ReactElement {
    const ctx = React.useContext(TabsContext);
    const size = ctx.size ?? 'm';
    const orientation = ctx.orientation ?? 'horizontal';
    const appearance = ctx.appearance ?? 'primary';
    const appearanceRole = useSurfaceTokens(appearance);
    return (
      <TabsList
        {...listProps}
        size={size}
        orientation={orientation}
        appearanceRole={appearanceRole}
      />
    );
  },
  Item: TabsItem,
  /** @deprecated Use `Tabs.Item` instead. */
  Tab: TabsItem,
  Panel: TabsPanel,
  Indicator: function TabsIndicatorCompound(): React.ReactElement | null {
    const ctx = React.useContext(TabsContext);
    const size = ctx.size ?? 'm';
    const orientation = ctx.orientation ?? 'horizontal';
    const appearance = ctx.appearance ?? 'primary';
    const appearanceRole = useSurfaceTokens(appearance);
    return <TabsIndicator size={size} orientation={orientation} appearanceRole={appearanceRole} />;
  },
});

export const TabItem = TabsItem;
export const TabPanel = TabsPanel;

export type {
  TabsProps,
  TabProps,
  TabPanelProps,
  TabListProps,
  TabGroupProps,
  TabItemProps,
} from './interface';
