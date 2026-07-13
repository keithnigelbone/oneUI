import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDocument = forwardRef<SVGSVGElement, IconComponentProps>(function IcDocument(
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
            d="M13 6V2H7.5A2.5 2.5 0 0 0 5 4.5v15A2.5 2.5 0 0 0 7.5 22h10a2.5 2.5 0 0 0 2.5-2.5V9h-4a3 3 0 0 1-3-3m3 1h4a2 2 0 0 0-.59-1.41l-3-3A2 2 0 0 0 15 2v4a1 1 0 0 0 1 1"
          />
    </svg>
  );
});

IcDocument.displayName = 'IcDocument';
