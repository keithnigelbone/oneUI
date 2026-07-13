import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGuestroom = forwardRef<SVGSVGElement, IconComponentProps>(function IcGuestroom(
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
            d="M7 20h10v-5H7zm7-16h-4a3 3 0 0 0-3 3v6h4v-1a1 1 0 0 1 2 0v1h4V7a3 3 0 0 0-3-3m1 4H9V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zM2 10v8a2 2 0 0 0 2 2h1V8H4a2 2 0 0 0-2 2m18-2h-1v12h1a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcGuestroom.displayName = 'IcGuestroom';
