import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAnalytics = forwardRef<SVGSVGElement, IconComponentProps>(function IcAnalytics(
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
            d="M14 11h8a10 10 0 0 0-9-8.95v8a1 1 0 0 0 1 .95m-3-1V2.05A10 10 0 1 0 22 13h-8a3 3 0 0 1-3-3"
          />
    </svg>
  );
});

IcAnalytics.displayName = 'IcAnalytics';
