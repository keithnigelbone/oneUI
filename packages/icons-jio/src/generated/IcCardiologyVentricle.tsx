import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCardiologyVentricle = forwardRef<SVGSVGElement, IconComponentProps>(function IcCardiologyVentricle(
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
            d="M13 4h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-2.41 0-4.43 1.72-4.9 4h2.08c.41-1.16 1.51-2 2.82-2m-1 3H8v.54c0 1.66 1.04 3.16 2.6 3.75l1.95.73c2.07.78 3.46 2.78 3.46 4.99 0 .55-.45 1-1 1s-1-.45-1-1c0-1.38-.87-2.63-2.16-3.12l-.84-.31v2.43c0 .55-.45 1-1 1s-1-.45-1-1v-3.28c-1.83-1.06-3-3.04-3-5.19V3c0-.55-.45-1-1-1s-1 .45-1 1v11c0 4.42 3.58 8 8 8h5c1.66 0 3-1.34 3-3v-4c0-4.42-3.58-8-8-8z"
          />
    </svg>
  );
});

IcCardiologyVentricle.displayName = 'IcCardiologyVentricle';
