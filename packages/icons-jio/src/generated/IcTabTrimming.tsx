import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTabTrimming = forwardRef<SVGSVGElement, IconComponentProps>(function IcTabTrimming(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
            fill="currentColor"
            d="M21.12 2.88C20.56 2.32 19.79 2 19 2h-8c-.8 0-1.56.32-2.12.88S8 4.21 8 5v1h5c1.33 0 2.6.53 3.54 1.46C17.48 8.4 18 9.67 18 11v5h1c.8 0 1.56-.32 2.12-.88S22 13.79 22 13V5c0-.8-.32-1.56-.88-2.12M13 8H5c-.8 0-1.56.32-2.12.88S2 10.21 2 11v8c0 .8.32 1.56.88 2.12S4.21 22 5 22h8c.8 0 1.56-.32 2.12-.88S16 19.79 16 19v-8c0-.8-.32-1.56-.88-2.12S13.79 8 13 8m-1.17 8.41a.996.996 0 1 1-1.41 1.41l-1.41-1.41-1.41 1.41a.996.996 0 1 1-1.41-1.41L7.6 15l-1.41-1.41a.996.996 0 1 1 1.41-1.41l1.41 1.41 1.41-1.41a.996.996 0 1 1 1.41 1.41L10.42 15z"
          />
    </svg>
  );
});

IcTabTrimming.displayName = 'IcTabTrimming';
