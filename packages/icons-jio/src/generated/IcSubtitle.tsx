import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSubtitle = forwardRef<SVGSVGElement, IconComponentProps>(function IcSubtitle(
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
            d="M19 4H5C3.34 4 2 5.34 2 7v10c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3M8.5 14h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-1.65 0-3-1.35-3-3v-2c0-1.65 1.35-3 3-3h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1m7 0h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-1.65 0-3-1.35-3-3v-2c0-1.65 1.35-3 3-3h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1"
          />
    </svg>
  );
});

IcSubtitle.displayName = 'IcSubtitle';
