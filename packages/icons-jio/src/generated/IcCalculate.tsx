import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCalculate = forwardRef<SVGSVGElement, IconComponentProps>(function IcCalculate(
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
            d="M5 8h1v1a1 1 0 0 0 2 0V8h1a1 1 0 0 0 0-2H8V5a1 1 0 0 0-2 0v1H5a1 1 0 0 0 0 2m4.21 6.79a1 1 0 0 0-1.42 0l-.79.8-.79-.8a1.005 1.005 0 0 0-1.714.71c0 .266.106.522.294.71l.8.79-.8.79a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l.79-.8.79.8a1 1 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095l-.8-.79.8-.79a1 1 0 0 0 0-1.42M15 8h4a1 1 0 1 0 0-2h-4a1 1 0 1 0 0 2m5 3h-7V4a1 1 0 0 0-2 0v7H4a1 1 0 0 0 0 2h7v7a1 1 0 0 0 2 0v-7h7a1 1 0 0 0 0-2m-1 6.5h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2m0-3h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcCalculate.displayName = 'IcCalculate';
