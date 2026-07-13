import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCardiology = forwardRef<SVGSVGElement, IconComponentProps>(function IcCardiology(
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
            d="M12 7H6V3c0-.55-.45-1-1-1s-1 .45-1 1v11c0 4.42 3.58 8 8 8h5c1.66 0 3-1.34 3-3v-4c0-4.42-3.58-8-8-8m1-3h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-2.41 0-4.43 1.72-4.9 4h2.08c.41-1.16 1.51-2 2.82-2"
          />
    </svg>
  );
});

IcCardiology.displayName = 'IcCardiology';
