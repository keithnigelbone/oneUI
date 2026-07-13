import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcReturn = forwardRef<SVGSVGElement, IconComponentProps>(function IcReturn(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1.5 14H9.41l.3.29a1.004 1.004 0 1 1-1.42 1.42l-2-2a1 1 0 0 1 0-1.42l2-2a1 1 0 0 1 1.639.325 1 1 0 0 1-.219 1.095l-.3.29h4.09a2.5 2.5 0 0 0 0-5H10a1 1 0 0 1 0-2h3.5a4.5 4.5 0 1 1 0 9"
          />
    </svg>
  );
});

IcReturn.displayName = 'IcReturn';
