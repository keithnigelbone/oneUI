import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNext = forwardRef<SVGSVGElement, IconComponentProps>(function IcNext(
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
            d="M9 20a1 1 0 0 1-1.006-1 1 1 0 0 1 .296-.71l6.3-6.29-6.3-6.29a1.004 1.004 0 0 1 1.42-1.42l7 7a1 1 0 0 1 .219 1.095 1 1 0 0 1-.22.325l-7 7A1 1 0 0 1 9 20"
          />
    </svg>
  );
});

IcNext.displayName = 'IcNext';
