import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoneybag = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoneybag(
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
            d="M11 5h2a2 2 0 0 0 2-2 1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1 2 2 0 0 0 2 2m8 13.28V14a7 7 0 0 0-5-6.71V7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.29A7 7 0 0 0 5 14v4.28A2 2 0 0 0 4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0-1-1.72M14.5 14a3 3 0 0 1-1.11 2.33l1.56.78A1 1 0 0 1 14.5 19a.93.93 0 0 1-.45-.11l-4-2A1 1 0 0 1 10.5 15h1a1 1 0 0 0 0-2h-2a1 1 0 0 1 0-2h5a1 1 0 0 1 0 2h-.18a3 3 0 0 1 .18 1"
          />
    </svg>
  );
});

IcMoneybag.displayName = 'IcMoneybag';
