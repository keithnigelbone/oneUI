import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPowerplay = forwardRef<SVGSVGElement, IconComponentProps>(function IcPowerplay(
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
            d="M4.5 5.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0M21.98 11.47C21.7 7.22 17.98 4 13.72 4H6.74a1.25 1.25 0 0 0 0 2.5h.75c.55 0 1 .45 1 1s-.45 1-1 1H3.25a1.25 1.25 0 0 0 0 2.5H5.5c.55 0 1 .45 1 1s-.45 1-1 1H3.25a1.25 1.25 0 0 0 0 2.5H7.5c.55 0 1 .45 1 1s-.45 1-1 1H5.75a1.25 1.25 0 0 0 0 2.5H14a8 8 0 0 0 7.98-8.53M15 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m2.9-6.72-1.47-.21-.66-1.33c-.31-.64-1.22-.64-1.54 0l-.66 1.33-1.47.21c-.7.1-.98.97-.48 1.46l1.07 1.04-.25 1.47c-.12.7.62 1.23 1.24.9l1.32-.69 1.32.69c.63.33 1.36-.2 1.24-.9l-.25-1.47 1.07-1.04c.51-.5.23-1.36-.48-1.46"
          />
    </svg>
  );
});

IcPowerplay.displayName = 'IcPowerplay';
