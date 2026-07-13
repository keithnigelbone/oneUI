import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTetris = forwardRef<SVGSVGElement, IconComponentProps>(function IcTetris(
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
            d="M3.176 18.941h3.53c.65 0 1.176-.526 1.176-1.176v-3.53c0-.65-.526-1.176-1.176-1.176h-3.53c-.65 0-1.176.527-1.176 1.176v3.53c0 .65.527 1.176 1.176 1.176M10.235 18.941h3.53c.65 0 1.176-.526 1.176-1.176v-3.53c0-.65-.527-1.176-1.176-1.176h-3.53c-.65 0-1.176.527-1.176 1.176v3.53c0 .65.527 1.176 1.176 1.176M10.235 11.882h3.53c.65 0 1.176-.526 1.176-1.176v-3.53c0-.65-.527-1.176-1.176-1.176h-3.53c-.65 0-1.176.527-1.176 1.176v3.53c0 .65.527 1.176 1.176 1.176M17.294 11.882h3.53c.65 0 1.176-.526 1.176-1.176v-3.53C22 6.526 21.473 6 20.823 6h-3.529c-.65 0-1.176.527-1.176 1.176v3.53c0 .65.526 1.176 1.176 1.176"
          />
    </svg>
  );
});

IcTetris.displayName = 'IcTetris';
