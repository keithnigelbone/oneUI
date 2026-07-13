import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArrowLineDiagonal = forwardRef<SVGSVGElement, IconComponentProps>(function IcArrowLineDiagonal(
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
            d="M20 15c-.55 0-1 .45-1 1v1.59L6.41 5H8c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V6.41L17.59 19H16c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1"
          />
    </svg>
  );
});

IcArrowLineDiagonal.displayName = 'IcArrowLineDiagonal';
