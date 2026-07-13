import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcOutgoing = forwardRef<SVGSVGElement, IconComponentProps>(function IcOutgoing(
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
            d="M19.92 4.62a1 1 0 0 0-.54-.54A1 1 0 0 0 19 4H9a1 1 0 0 0 0 2h7.59L4.29 18.29a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219L18 7.41V15a1 1 0 0 0 2 0V5a1 1 0 0 0-.08-.38"
          />
    </svg>
  );
});

IcOutgoing.displayName = 'IcOutgoing';
