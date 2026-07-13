import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGlobe = forwardRef<SVGSVGElement, IconComponentProps>(function IcGlobe(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-1 17.93A8 8 0 0 1 4 12a8 8 0 0 1 .21-1.79L9 15v1a1 1 0 0 0 1 1h1zm7.72-3.61A1 1 0 0 0 18 16h-3v-3a1 1 0 0 0-1-1H9v-2h2a1 1 0 0 0 1-1V7h3V4.59A8 8 0 0 1 20 12a7.9 7.9 0 0 1-1.28 4.32"
          />
    </svg>
  );
});

IcGlobe.displayName = 'IcGlobe';
