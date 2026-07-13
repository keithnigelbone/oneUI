import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAntiCorrosion = forwardRef<SVGSVGElement, IconComponentProps>(function IcAntiCorrosion(
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
            d="M12 16a5 5 0 0 0 5-5 6.3 6.3 0 0 0-.91-3.24l-3.24-5.28a1 1 0 0 0-1.7 0L7.91 7.76A6.3 6.3 0 0 0 7 11a5 5 0 0 0 5 5m7 2H5a1 1 0 1 0 0 2h.59l-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0L8.41 20h2.18l-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l1.7-1.71h2.18l-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l1.7-1.71H19a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcAntiCorrosion.displayName = 'IcAntiCorrosion';
