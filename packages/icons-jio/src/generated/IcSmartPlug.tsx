import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmartPlug = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmartPlug(
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
            d="M18 6h-1V3a1 1 0 0 0-2 0v3H9V3a1 1 0 0 0-2 0v3H6a2 2 0 0 0-2 2v10a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a2 2 0 0 0-2-2m-6 11a3 3 0 1 1 0-5.999A3 3 0 0 1 12 17"
          />
    </svg>
  );
});

IcSmartPlug.displayName = 'IcSmartPlug';
