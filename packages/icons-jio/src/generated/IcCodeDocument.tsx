import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCodeDocument = forwardRef<SVGSVGElement, IconComponentProps>(function IcCodeDocument(
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
            d="M17.5 2H10a2 2 0 0 0-1.41.59l-3 3A2 2 0 0 0 5 7v12.5A2.5 2.5 0 0 0 7.5 22h10a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 17.5 2m-6.79 11.29a1.002 1.002 0 0 1-.325 1.639 1 1 0 0 1-1.095-.219l-2-2a1 1 0 0 1 0-1.42l2-2a1.004 1.004 0 0 1 1.42 1.42L9.41 12zm7-.58-2 2a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l1.3-1.29-1.3-1.29a1.004 1.004 0 1 1 1.42-1.42l2 2a1 1 0 0 1 0 1.42"
          />
    </svg>
  );
});

IcCodeDocument.displayName = 'IcCodeDocument';
