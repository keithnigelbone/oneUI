import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcScreen = forwardRef<SVGSVGElement, IconComponentProps>(function IcScreen(
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
            d="M20 4H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7v2H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2h7a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcScreen.displayName = 'IcScreen';
