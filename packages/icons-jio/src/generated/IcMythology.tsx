import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMythology = forwardRef<SVGSVGElement, IconComponentProps>(function IcMythology(
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
            d="M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0m-8.79 3.79a1.004 1.004 0 1 0-1.42 1.42L7 13.37a.77.77 0 1 1-1.09 1.09l-1.32-1.29A2 2 0 0 1 4 11.76V7.53a1 1 0 0 0-2 0v4.23a4 4 0 0 0 1.17 2.83l2.54 2.53a1 1 0 0 1 .29.71V19a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3.17a3 3 0 0 0-.88-2.12zM21 6.53a1 1 0 0 0-1 1v4.23a2 2 0 0 1-.59 1.41l-1.28 1.29A.785.785 0 0 1 17 13.37l1.17-1.16a1.004 1.004 0 1 0-1.42-1.42l-2.91 2.92a3 3 0 0 0-.84 2.12V19a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1.17a1 1 0 0 1 .29-.71l2.54-2.53A4 4 0 0 0 22 11.76V7.53a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcMythology.displayName = 'IcMythology';
