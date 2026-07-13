import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGhost = forwardRef<SVGSVGElement, IconComponentProps>(function IcGhost(
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
            d="M12 2a8 8 0 0 0-8 8v9.82a.94.94 0 0 0 1 .95.88.88 0 0 0 .73-.37l.24-.31a1 1 0 0 1 .74-.37.93.93 0 0 1 .77.41l1 1.42a1 1 0 0 0 .79.41.92.92 0 0 0 .73-.35l1.3-1.58a.91.91 0 0 1 .73-.34.94.94 0 0 1 .76.4l1 1.47a.93.93 0 0 0 .77.4.92.92 0 0 0 .73-.35L16.55 20a1 1 0 0 1 .73-.35.9.9 0 0 1 .74.37l.29.38a.91.91 0 0 0 .74.37.94.94 0 0 0 .95-.95V10a8 8 0 0 0-8-8M8.71 12.16a2.51 2.51 0 1 1-.02-5.02 2.51 2.51 0 0 1 .02 5.02m6.57 0a2.51 2.51 0 1 1-.02-5.02 2.51 2.51 0 0 1 .02 5.02"
          />
    </svg>
  );
});

IcGhost.displayName = 'IcGhost';
