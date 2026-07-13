import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCarSide = forwardRef<SVGSVGElement, IconComponentProps>(function IcCarSide(
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
            d="M20 10h-2.41l-1.37-2.46A3 3 0 0 0 13.6 6H8.46a3 3 0 0 0-2.6 1.5l-1.47 2.56A3 3 0 0 0 2 13v1a2 2 0 0 0 2 2h.18a3 3 0 0 0 5.64 0h4.36a3 3 0 0 0 5.64 0H20a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2M7 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2-6H7l.72-1.45a1 1 0 0 1 .9-.55H9zm2 0V8h2.38a1 1 0 0 1 .9.55L15 10zm6 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcCarSide.displayName = 'IcCarSide';
