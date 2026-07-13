import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGlucometer = forwardRef<SVGSVGElement, IconComponentProps>(function IcGlucometer(
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
            d="M12.21 5.62s-.05-.07-.09-.09A.3.3 0 0 0 12 5.5q-.06 0-.12.03t-.09.09L10.61 7.6c-.21.35-.32.74-.32 1.15 0 .46.18.91.5 1.24a1.665 1.665 0 0 0 2.4 0c.32-.33.5-.77.5-1.24 0-.41-.11-.8-.32-1.15l-1.18-1.98zM16.48 2H7.53C6.69 2 6 2.68 6 3.53V10c0 2.62 1.69 4.85 4.03 5.66A2 2 0 0 1 12 14c.99 0 1.8.72 1.97 1.66A5.98 5.98 0 0 0 18 10V3.53C18 2.69 17.32 2 16.47 2zm-.47 8.9c0 .61-.49 1.1-1.1 1.1H9.12c-.61 0-1.1-.49-1.1-1.1V5.11c0-.61.49-1.1 1.1-1.1h5.79c.61 0 1.1.49 1.1 1.1zm-4 4.1c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1s1-.45 1-1v-5c0-.55-.45-1-1-1"
          />
    </svg>
  );
});

IcGlucometer.displayName = 'IcGlucometer';
