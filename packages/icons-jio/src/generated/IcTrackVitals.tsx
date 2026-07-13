import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTrackVitals = forwardRef<SVGSVGElement, IconComponentProps>(function IcTrackVitals(
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
            d="M15.6 4A5.6 5.6 0 0 0 12 5.46 5.6 5.6 0 0 0 8.4 4 5.36 5.36 0 0 0 3 9.44c0 3.37 2.63 6.43 7.16 10.56l.49.45a2 2 0 0 0 2.7 0l.49-.44C18.37 15.86 21 12.8 21 9.44A5.36 5.36 0 0 0 15.6 4m1.4 8h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 1 1 0-2h1V9a1 1 0 1 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcTrackVitals.displayName = 'IcTrackVitals';
