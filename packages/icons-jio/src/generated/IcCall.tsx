import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCall = forwardRef<SVGSVGElement, IconComponentProps>(function IcCall(
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
            d="M8.27 15.73c3.74 3.75 7.07 3.85 8.48 3.68a1.9 1.9 0 0 0 1.13-.57l1-1a2 2 0 0 0 0-2.83l-.71-.71a2 2 0 0 0-2.82 0l-.71.71a1 1 0 0 1-1.095.219 1 1 0 0 1-.325-.219L9 10.79a1 1 0 0 1 0-1.42l.71-.71a2 2 0 0 0 0-2.82L9 5.13a2 2 0 0 0-2.83 0l-1 1a1.9 1.9 0 0 0-.57 1.13c-.18 1.4-.08 4.74 3.67 8.47"
          />
    </svg>
  );
});

IcCall.displayName = 'IcCall';
