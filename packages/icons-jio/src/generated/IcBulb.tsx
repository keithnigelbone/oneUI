import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBulb = forwardRef<SVGSVGElement, IconComponentProps>(function IcBulb(
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
            d="M7.4 7.9a1 1 0 0 0 0-1.41l-.7-.71A1.004 1.004 0 1 0 5.28 7.2l.72.7a1 1 0 0 0 1.41 0zm-2.9 3.6h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2M12 6a1 1 0 0 0 1-1V4a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1m2 13h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2m6.5-7.5h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m-1.78-5.72a1 1 0 0 0-1.42 0l-.7.71a1 1 0 0 0 0 1.41 1 1 0 0 0 1.4 0l.71-.7a1 1 0 0 0 .01-1.42M12 7a5.87 5.87 0 0 0-3.1 10.85 1 1 0 0 0 .53.15h5.14a1 1 0 0 0 .53-.15A5.87 5.87 0 0 0 12 7"
          />
    </svg>
  );
});

IcBulb.displayName = 'IcBulb';
