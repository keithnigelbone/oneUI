import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcProjection = forwardRef<SVGSVGElement, IconComponentProps>(function IcProjection(
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
            d="M20 14h-1V5h1a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2h1v9H4a1 1 0 0 0 0 2h5.92l-2.7 3.38A1 1 0 0 0 8 21a1 1 0 0 0 .78-.38L11 17.85V20a1 1 0 0 0 2 0v-2.15l2.22 2.77A1 1 0 0 0 16 21a1 1 0 0 0 .78-1.62L14.08 16H20a1 1 0 0 0 0-2m-3.29-4.79a1 1 0 0 1-1.42 0l-.68-.69-2.31 3.08a1 1 0 0 1-.73.4 1.07 1.07 0 0 1-.78-.29l-1.18-1.19-.81 1.08a1 1 0 1 1-1.6-1.2l1.5-2a1 1 0 0 1 1.51-.11l1.18 1.19L13.7 6.4a1 1 0 0 1 1.51-.11l1.5 1.5a1 1 0 0 1 0 1.42"
          />
    </svg>
  );
});

IcProjection.displayName = 'IcProjection';
