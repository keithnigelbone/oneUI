import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStairway = forwardRef<SVGSVGElement, IconComponentProps>(function IcStairway(
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
            d="M12 2a8 8 0 0 0-8 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V10a8 8 0 0 0-8-8m6 18H6v-1a1 1 0 0 1 1-1h11zm0-4H8v-1a1 1 0 0 1 1-1h9zm0-4h-8v-1a1 1 0 0 1 1-1h7z"
          />
    </svg>
  );
});

IcStairway.displayName = 'IcStairway';
