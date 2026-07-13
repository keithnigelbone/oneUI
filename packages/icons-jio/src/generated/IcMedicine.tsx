import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMedicine = forwardRef<SVGSVGElement, IconComponentProps>(function IcMedicine(
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
            d="M19.12 8.71 18 7.59A2 2 0 0 0 16.59 7H17a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h.41A2 2 0 0 0 6 7.59L4.88 8.71A3 3 0 0 0 4 10.83V19a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8.17a3 3 0 0 0-.88-2.12M14 15h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcMedicine.displayName = 'IcMedicine';
