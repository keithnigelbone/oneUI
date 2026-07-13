import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTrolleyClearance = forwardRef<SVGSVGElement, IconComponentProps>(function IcTrolleyClearance(
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
            d="M7.5 10h9a1 1 0 0 0 1-1A5.17 5.17 0 0 0 13 4.08.2.2 0 0 0 13 4a1 1 0 0 0-2 0 .2.2 0 0 0 0 .08A5.17 5.17 0 0 0 6.5 9a1 1 0 0 0 1 1m14.31 1.42A1 1 0 0 0 21 11H3a1 1 0 0 0-.81.42 1 1 0 0 0-.14.9l2 6A1 1 0 0 0 5 19h1.59a1.6 1.6 0 0 0-.09.5 1.5 1.5 0 0 0 3 0 1.6 1.6 0 0 0-.09-.5h5.18q-.084.243-.09.5a1.5 1.5 0 1 0 3 0 1.7 1.7 0 0 0-.09-.5H19a1 1 0 0 0 .95-.68l2-6a1 1 0 0 0-.14-.9"
          />
    </svg>
  );
});

IcTrolleyClearance.displayName = 'IcTrolleyClearance';
