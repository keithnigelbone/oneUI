import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSelect = forwardRef<SVGSVGElement, IconComponentProps>(function IcSelect(
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
            d="m20.52 9.04-15-6.82C4.14 1.59 2.4 2.31 2 4.07c-.1.46-.03.94.17 1.36L9.1 20.67c.19.42.5.79.91 1 1.71.88 3.44-.13 3.75-1.68l.51-2.57a4.01 4.01 0 0 1 3.14-3.14l2.72-.54c.45-.09.89-.31 1.18-.66 1.24-1.46.66-3.38-.79-4.04"
          />
    </svg>
  );
});

IcSelect.displayName = 'IcSelect';
