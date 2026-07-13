import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAerobics = forwardRef<SVGSVGElement, IconComponentProps>(function IcAerobics(
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
            d="M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m7 1H5a1 1 0 0 0 0 2h6v5.07a6.32 6.32 0 0 0-3.8 1.75A8.5 8.5 0 0 0 5 21a1 1 0 1 0 2 0 6.66 6.66 0 0 1 1.61-4.76 4.3 4.3 0 0 1 2.5-1.17c.74 3.89 5.31 5.77 5.52 5.86a1 1 0 1 0 .74-1.86S13 17.29 13 14V8h6a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcAerobics.displayName = 'IcAerobics';
