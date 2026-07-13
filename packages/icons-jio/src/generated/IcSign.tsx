import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSign = forwardRef<SVGSVGElement, IconComponentProps>(function IcSign(
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
            d="M20.3 3.7a12.88 12.88 0 0 0-8.45 0 13.1 13.1 0 0 0-8.16 16.62 1 1 0 0 0 .95.68q.18.026.36 0a1 1 0 0 0 .62-1.27 11.7 11.7 0 0 1-.48-2.13c.791.15 1.594.228 2.4.23a13.47 13.47 0 0 0 7.28-2.12 1 1 0 0 0 .39-1.15L14 11l4.06.68a1 1 0 0 0 1-.46A13.53 13.53 0 0 0 21 4.67a1 1 0 0 0-.7-.97"
          />
    </svg>
  );
});

IcSign.displayName = 'IcSign';
