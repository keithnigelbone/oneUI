import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRemoteRecord = forwardRef<SVGSVGElement, IconComponentProps>(function IcRemoteRecord(
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
            d="M13 9.5h-3v2h3a1 1 0 0 0 0-2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.83 13a1 1 0 0 1-.28 1.38.94.94 0 0 1-.55.17 1 1 0 0 1-.83-.45l-1.71-2.6H10v2a1 1 0 1 1-2 0v-7a1 1 0 0 1 1-1h4a3 3 0 0 1 1.57 5.55z"
          />
    </svg>
  );
});

IcRemoteRecord.displayName = 'IcRemoteRecord';
