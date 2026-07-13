import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSpotcolor = forwardRef<SVGSVGElement, IconComponentProps>(function IcSpotcolor(
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
            d="M5.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M12 19a1 1 0 1 0 0 2 1 1 0 0 0 0-2m5-11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1 1a3 3 0 0 0-2.5 1.34L14 10a4 4 0 1 0-6.79 2.89l-.68 1.19A3 3 0 0 0 6 14a3 3 0 1 0 3 3 3 3 0 0 0-.74-1.95L9 13.84q.488.149 1 .16a4 4 0 0 0 3.5-2.09l1.53.38A3 3 0 1 0 18 9"
          />
    </svg>
  );
});

IcSpotcolor.displayName = 'IcSpotcolor';
