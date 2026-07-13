import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoneyLoan = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoneyLoan(
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
            d="M16.49 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19.71 14.89a.98.98 0 0 0-1.41 0l-2.53 2.53c-.38.38-.88.59-1.41.59h-3.35c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1-.45 1-1s-.45-1-1-1h-4c-1.1 0-2 .9-2 2h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h9.35c1.07 0 2.07-.42 2.83-1.17l2.53-2.53a.996.996 0 0 0 0-1.41z"
          />
    </svg>
  );
});

IcMoneyLoan.displayName = 'IcMoneyLoan';
