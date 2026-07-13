import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSquats = forwardRef<SVGSVGElement, IconComponentProps>(function IcSquats(
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
            d="M17.23 6.01h-7.05c-.88 0-1.66.55-1.95 1.38l-2.29 5.2c-.28.64-.22 1.37.16 1.96.38.58 1.03.93 1.73.93l3.41.02-1.11 5.29c-.12.54.23 1.07.77 1.19.07.01.14.02.21.02.46 0 .88-.32.98-.79l1.09-5.12c.17-.62.04-1.28-.35-1.79s-.99-.81-1.64-.81H7.83l2.35-5.47h7.05c.55 0 1-.45 1-1s-.45-1.01-1-1.01M11.26 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
          />
    </svg>
  );
});

IcSquats.displayName = 'IcSquats';
