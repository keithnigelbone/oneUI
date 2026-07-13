import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWarranty = forwardRef<SVGSVGElement, IconComponentProps>(function IcWarranty(
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
            d="M8.71 11.29a1.004 1.004 0 1 0-1.42 1.42l3 3a1 1 0 0 0 1.42 0l10-10a1.004 1.004 0 0 0-1.42-1.42L11 13.59zM20.83 10a1 1 0 0 0-.83 1.12q.023.44 0 .88a8 8 0 1 1-8-8 7.8 7.8 0 0 1 3.55.84 1.002 1.002 0 0 0 .9-1.79A9.84 9.84 0 0 0 12 2a10 10 0 1 0 10 10 8 8 0 0 0-.07-1.12 1 1 0 0 0-1.1-.88"
          />
    </svg>
  );
});

IcWarranty.displayName = 'IcWarranty';
