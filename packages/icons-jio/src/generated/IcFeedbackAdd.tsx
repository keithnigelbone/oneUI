import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFeedbackAdd = forwardRef<SVGSVGElement, IconComponentProps>(function IcFeedbackAdd(
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
            d="M17 6h1v1a1 1 0 0 0 2 0V6h1a1 1 0 1 0 0-2h-1V3a1 1 0 0 0-2 0v1h-1a1 1 0 1 0 0 2m2 4a3 3 0 0 1-2.87-2.13 3 3 0 0 1-2-3.87H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h3v1a2 2 0 0 0 3.2 1.6l3.47-2.6H19a3 3 0 0 0 3-3V7.82h-.13A3 3 0 0 1 19 10M7 8h3a1 1 0 1 1 0 2H7a1 1 0 0 1 0-2m10 6H7a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcFeedbackAdd.displayName = 'IcFeedbackAdd';
