import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcOlympics = forwardRef<SVGSVGElement, IconComponentProps>(function IcOlympics(
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
            d="M16.71 12.29A1 1 0 0 0 16 12H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.72L10 21.24a1 1 0 0 0 1 .76h2a1 1 0 0 0 1-.76L15.28 16H16a1 1 0 0 0 1-1v-2a1 1 0 0 0-.29-.71M8.15 10H9c0-2 1.72-1.11 2-3.28a.53.53 0 0 1 .66-.42C13.81 6.89 14 9 14 10h1a1 1 0 0 0 1-1 8.12 8.12 0 0 0-4.6-6.84 1 1 0 0 0-1.48 1.01c.39 2.12-2.06 3.32-2.75 5.62A1 1 0 0 0 8.15 10"
          />
    </svg>
  );
});

IcOlympics.displayName = 'IcOlympics';
