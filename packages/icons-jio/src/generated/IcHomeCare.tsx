import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHomeCare = forwardRef<SVGSVGElement, IconComponentProps>(function IcHomeCare(
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
            d="M20.69 15.06a1 1 0 0 0-1.41 0l-2.17 2.28a2 2 0 0 1-1.45.62H12a1 1 0 1 1 0-2h1.66a1 1 0 1 0 0-2H8a2 2 0 0 0-2 2H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h11.66a4 4 0 0 0 2.89-1.24l2.17-2.28a1 1 0 0 0-.03-1.38M14 9v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V9a1 1 0 0 0 .92-.62 1 1 0 0 0-.21-1.09l-3-3a1 1 0 0 0-1.42 0l-3 3a1 1 0 0 0-.21 1.09A1 1 0 0 0 14 9"
          />
    </svg>
  );
});

IcHomeCare.displayName = 'IcHomeCare';
