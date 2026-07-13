import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBloodGlucoseMeter = forwardRef<SVGSVGElement, IconComponentProps>(function IcBloodGlucoseMeter(
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
            d="M10 22c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1h-4zm7-19H7C5.34 3 4 4.34 4 6v8c0 3.31 2.69 6 6 6h4c3.31 0 6-2.69 6-6V6c0-1.66-1.34-3-3-3m-4 13h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1m3-6c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h6c.55 0 1 .45 1 1z"
          />
    </svg>
  );
});

IcBloodGlucoseMeter.displayName = 'IcBloodGlucoseMeter';
