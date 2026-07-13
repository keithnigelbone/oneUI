import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRedo = forwardRef<SVGSVGElement, IconComponentProps>(function IcRedo(
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
            d="m20.71 8.29-4-4a1.003 1.003 0 1 0-1.42 1.42L17.59 8H10a7 7 0 0 0-7 7v3a1 1 0 1 0 2 0v-3a5 5 0 0 1 5-5h7.59l-2.3 2.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 0-1.42"
          />
    </svg>
  );
});

IcRedo.displayName = 'IcRedo';
