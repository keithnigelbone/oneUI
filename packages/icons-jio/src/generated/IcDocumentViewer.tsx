import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDocumentViewer = forwardRef<SVGSVGElement, IconComponentProps>(function IcDocumentViewer(
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
            d="M9.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M16 7h4a2 2 0 0 0-.59-1.41l-3-3A2 2 0 0 0 15 2v4a1 1 0 0 0 1 1m-3-1V2H6.5A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22h11a2.5 2.5 0 0 0 2.5-2.5V9h-4a3 3 0 0 1-3-3m.62 10.78A1 1 0 0 1 13 17a1 1 0 0 1-.78-.38l-1.49-1.86A3.4 3.4 0 0 1 9.5 15a3.53 3.53 0 1 1 2.82-1.45l1.46 1.83a1 1 0 0 1-.16 1.4"
          />
    </svg>
  );
});

IcDocumentViewer.displayName = 'IcDocumentViewer';
