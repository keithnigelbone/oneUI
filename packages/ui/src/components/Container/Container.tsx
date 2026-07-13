'use client';

import type { CSSProperties } from 'react';
import clsx from 'clsx';
import { Surface } from '../Surface/Surface';
import styles from './Container.module.css';
import type { ContainerProps } from './Container.shared';
import {
  buildContainerWebLayoutStyle,
  containerUsesCustomPadding,
  resolveContainerMaxWidth,
} from './Container.shared';

export function Container({
  surface,
  appearance,
  variant = 'fluid',
  maxWidth,
  fullWidth: _fullWidth,
  as: Component = 'div',
  className,
  style,
  children,
  layout,
  direction,
  wrap,
  justify,
  align,
  alignSelf,
  columns,
  rows,
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  gap,
  rowGap,
  columnGap,
  width,
  height,
  minWidth,
  minHeight,
  maxHeight,
  position,
  top,
  right,
  bottom,
  left,
  zIndex,
  overflow,
  flex,
  grow,
  shrink,
  basis,
  ...rest
}: ContainerProps) {
  const maxW = resolveContainerMaxWidth(variant, maxWidth);

  const layoutInput = {
    layout,
    direction,
    wrap,
    justify,
    align,
    alignSelf,
    columns,
    rows,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    gap,
    rowGap,
    columnGap,
    width,
    height,
    minWidth,
    minHeight,
    maxHeight,
    position,
    top,
    right,
    bottom,
    left,
    zIndex,
    overflow,
    flex,
    grow,
    shrink,
    basis,
    maxWidthBox:
      maxW.kind === 'preset' ? maxW.value : undefined,
  };

  const layoutStyle = buildContainerWebLayoutStyle(layoutInput);

  if (maxW.kind === 'css') {
    layoutStyle.maxWidth = maxW.value;
  }

  const customPad = containerUsesCustomPadding(layoutInput);
  const classNames = clsx(
    styles.container,
    styles[variant as keyof typeof styles],
    customPad && styles.resetInlinePad,
    className,
  );

  const capStyle: CSSProperties = {};
  if (maxW.kind === 'cap') {
    // INTENTIONAL-LITERAL: legacy numeric `maxWidth` cap matches native fixed viewport (px).
    (capStyle as Record<string, string>)['--_container-max-width'] =
      typeof maxW.value === 'number' ? `${maxW.value}px` : maxW.value;
  }

  const mergedStyle: CSSProperties = {
    ...layoutStyle,
    ...capStyle,
    ...style,
  };

  return (
    <Surface
      mode={surface}
      appearance={appearance}
      as={Component}
      className={classNames}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Surface>
  );
}
