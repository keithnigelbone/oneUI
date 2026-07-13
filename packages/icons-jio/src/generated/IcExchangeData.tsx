import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcExchangeData = forwardRef<SVGSVGElement, IconComponentProps>(function IcExchangeData(
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
            d="M9 9H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2M7 20A1 1 0 1 1 7 18 1 1 0 0 1 7 20M19 2h-4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2m-2 11A1 1 0 1 1 17 11 1 1 0 0 1 17 13m3 5h-3.59l.3-.29a1.004 1.004 0 1 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1.002 1.002 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095l-.3-.29H20a1 1 0 0 0 0-2M8.71 2.29a1.004 1.004 0 1 0-1.42 1.42l.3.29H4a1 1 0 1 0 0 2h3.59l-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42z"
          />
    </svg>
  );
});

IcExchangeData.displayName = 'IcExchangeData';
