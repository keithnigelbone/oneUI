import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmartOutlet = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmartOutlet(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-9 9a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0zm3 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5-6a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcSmartOutlet.displayName = 'IcSmartOutlet';
