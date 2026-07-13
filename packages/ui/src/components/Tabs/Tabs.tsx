/**
 * Tabs.tsx — compound API (Tabs.Root / Tabs.List / Tabs.Item / Tabs.Panel / Tabs.Indicator)
 *
 * Wraps Base UI Tabs primitive (@base-ui/react/tabs). Never forks Base UI.
 * The flat API (TabGroup + TabItem) is in separate files and builds on these primitives.
 *
 * Back-compat: Tabs.Tab is a deprecated alias for Tabs.Item (kept so the existing
 * `apps/platform/.../components/tabs/page.tsx` keeps working until it's migrated).
 */

'use client';

import React, { useMemo } from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import clsx from 'clsx';
import styles from './Tabs.module.css';
import {
  TabsProps,
  TabProps,
  TabPanelProps,
  TabListProps,
  resolveTabItemState,
} from './Tabs.shared';
import { useSurfaceAppearance } from '../Surface';
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { TabsContext } from './TabsContext';

/* Map resolved appearance to CSS module class (9 roles — Primary is default). */
const appearanceClassMap = makeAppearanceClassMap(styles);

/* ============================================================
   Tabs.Root — orientation + value management
   ============================================================ */

function TabsRoot({
  children, value, defaultValue, onValueChange, orientation = 'horizontal', size, appearance = 'auto', className, ref,
}: TabsProps & { ref?: React.Ref<HTMLDivElement> }) {
  const rootClassName = clsx(styles.root, className);
  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance =
    appearance && appearance !== 'auto'
      ? appearance
      : (parentAppearance ?? 'primary');

  const contextValue = useMemo(
    () => ({ size, orientation, appearance: resolvedAppearance }),
    [size, orientation, resolvedAppearance],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <BaseTabs.Root
        ref={ref}
        value={value ?? undefined}
        defaultValue={defaultValue ?? undefined}
        onValueChange={onValueChange as any}
        orientation={orientation}
        className={rootClassName}
      >
        {children}
      </BaseTabs.Root>
    </TabsContext.Provider>
  );
}

/* ============================================================
   Tabs.List — wraps tab triggers + indicator
   ============================================================ */

function TabsList({ children, activateOnFocus, loopFocus = true, size, appearance, orientation, className, ref }: TabListProps & { size?: string; appearance?: string; orientation?: string; ref?: React.Ref<HTMLDivElement> }) {
    const cls = clsx(styles.list, className);
    // Carry size + appearance as data attrs on the list so the indicator can
    // remap its color / span without needing props drilling.
    const dataAttrs: Record<string, string | undefined> = {
      ...(size ? { 'data-size': size } : {}),
      ...(appearance ? { 'data-appearance': appearance } : {}),
      ...(orientation ? { 'data-orientation': orientation } : {}),
    };
    return (
      <BaseTabs.List
        ref={ref}
        activateOnFocus={activateOnFocus}
        loopFocus={loopFocus}
        className={cls}
        {...dataAttrs}
      >
        {children}
      </BaseTabs.List>
    );
}

/* ============================================================
   Tabs.Item — individual tab trigger (with slot composition)
   ============================================================ */

function TabsItem({
  children,
  value,
  disabled,
  icon,
  badge,
  start: startProp,
  end: endProp,
  size: sizeProp,
  appearance: appearanceProp,
  'aria-label': ariaLabel,
  'data-force-state': forceState,
  className,
  style,
  ref,
}: TabProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const ctx = React.useContext(TabsContext);
  const parentAppearance = useSurfaceAppearance();
  const { resolvedAppearance, dataAttrs } = resolveTabItemState({
    size: sizeProp,
    appearance: appearanceProp,
    orientation: ctx.orientation,
    ctxSize: ctx.size,
    ctxAppearance: ctx.appearance,
    ctxOrientation: ctx.orientation,
    disabled,
    parentAppearance,
  });

  const startContent = startProp ?? icon;
  const endContent = endProp ?? badge;
  const hasLabel = Boolean(children);
  const isIconOnly = !hasLabel && Boolean(startContent) && !endContent;

  if (process.env.NODE_ENV !== 'production' && isIconOnly && !ariaLabel) {
    console.warn('TabItem: icon-only tabs require an `aria-label` prop for accessibility.');
  }

  const cls = clsx(styles.tab, appearanceClassMap[resolvedAppearance], className);

  return (
    <BaseTabs.Tab
      ref={ref}
      value={value}
      disabled={disabled}
      className={cls}
      aria-label={ariaLabel}
      style={style}
      data-force-state={forceState}
      {...dataAttrs}
    >
      {/* State layer — padded, rounded. Focus halo only; Figma keeps it transparent
          across idle/hover/selected/pressed. Hover feedback = label colour shift
          (no indicator), selected = tinted-a11y label + animated list-level bar. */}
      <span className={styles.stateLayer}>
        <span className={styles.contentWrapper}>
          {startContent && <span className={styles.start}>{startContent}</span>}
          {hasLabel && <span className={styles.label}>{children}</span>}
          {endContent && <span className={styles.end}>{endContent}</span>}
        </span>
      </span>
    </BaseTabs.Tab>
  );
}

/* ============================================================
   Tabs.Panel
   ============================================================ */

function TabsPanel({ children, value, className, ref }: TabPanelProps & { ref?: React.Ref<HTMLDivElement> }) {
  const cls = clsx(styles.panel, className);
  return (
    <BaseTabs.Panel ref={ref} value={value} className={cls}>
      {children}
    </BaseTabs.Panel>
  );
}

/* ============================================================
   Tabs.Indicator — animated selected-tab bar.
   Uses Base UI's --active-tab-{left,top,width,height} CSS vars which track
   the currently-selected Tab. CSS insets the bar to content-wrapper width
   so it visually matches Figma (indicator tracks label, not padded tab).
   ============================================================ */

function TabsIndicator({ className, orientation, ref }: { className?: string; orientation?: string; ref?: React.Ref<HTMLDivElement> }) {
  const cls = clsx(styles.selectedIndicator, className);
  return (
    <BaseTabs.Indicator
      ref={ref}
      className={cls}
      {...(orientation ? { 'data-orientation': orientation } : {})}
    />
  );
}

/* ============================================================
   Assembled namespace export
   ============================================================ */

export const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  List: TabsList,
  Item: TabsItem,
  /** @deprecated Use `Tabs.Item` instead. */
  Tab: TabsItem,
  Panel: TabsPanel,
  Indicator: TabsIndicator,
});
