import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNotes = forwardRef<SVGSVGElement, IconComponentProps>(function IcNotes(
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
            d="M20 8V6a3 3 0 0 0-3-3h-1.28A2 2 0 0 0 14 2h-4a2 2 0 0 0-1.72 1H7a3 3 0 0 0-3 3v13a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2m-2 0h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.28A2 2 0 0 0 10 6h4a2 2 0 0 0 1.72-1H17a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcNotes.displayName = 'IcNotes';
