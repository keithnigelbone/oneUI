import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcForward = forwardRef<SVGSVGElement, IconComponentProps>(function IcForward(
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
            d="m21.41 9.59-5-5a2 2 0 0 0-2.18-.44A2 2 0 0 0 13 6v2S2.75 9.86 2 19.84A1.09 1.09 0 0 0 3.07 21a1.08 1.08 0 0 0 1-.78C4.68 18.39 6.67 14 13 14v2a2 2 0 0 0 1.23 1.85 2 2 0 0 0 2.18-.44l5-5a2 2 0 0 0 0-2.82"
          />
    </svg>
  );
});

IcForward.displayName = 'IcForward';
