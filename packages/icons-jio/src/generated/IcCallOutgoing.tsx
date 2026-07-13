import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCallOutgoing = forwardRef<SVGSVGElement, IconComponentProps>(function IcCallOutgoing(
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
            d="M19.92 4.62a1 1 0 0 0-.54-.54A1 1 0 0 0 19 4h-3a1 1 0 0 0 0 2h.59l-2.3 2.29a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219L18 7.41V8a1 1 0 0 0 2 0V5a1 1 0 0 0-.08-.38m-1.76 9.7a2 2 0 0 0-2.82 0l-.71.71a1 1 0 0 1-1.42 0L9 10.79a1 1 0 0 1 0-1.42l.71-.71a2 2 0 0 0 0-2.82L9 5.13a2 2 0 0 0-2.83 0l-1 1a1.9 1.9 0 0 0-.57 1.13c-.18 1.4-.08 4.74 3.67 8.47s7.07 3.85 8.48 3.68a1.9 1.9 0 0 0 1.13-.57l1-1a2 2 0 0 0 0-2.83z"
          />
    </svg>
  );
});

IcCallOutgoing.displayName = 'IcCallOutgoing';
