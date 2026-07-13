import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBack = forwardRef<SVGSVGElement, IconComponentProps>(function IcBack(
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
            d="M15 20a1 1 0 0 1-.71-.29l-7-7a1 1 0 0 1 0-1.42l7-7a1.005 1.005 0 0 1 1.42 1.42L9.41 12l6.3 6.29a1 1 0 0 1 .219 1.095 1 1 0 0 1-.93.615"
          />
    </svg>
  );
});

IcBack.displayName = 'IcBack';
