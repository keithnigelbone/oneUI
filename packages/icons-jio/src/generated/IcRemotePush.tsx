import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRemotePush = forwardRef<SVGSVGElement, IconComponentProps>(function IcRemotePush(
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
            d="M17.12 2.88A3 3 0 0 0 15 2H9a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-.88-2.12M9 8h6l-3 1.83zm3.88 11.63A1.22 1.22 0 0 1 12 20a1.25 1.25 0 0 1-1.15-.77 1.27 1.27 0 0 1-.08-.72 1.3 1.3 0 0 1 1-1 1.27 1.27 0 0 1 1.279.539 1.25 1.25 0 0 1 .113 1.175 1.2 1.2 0 0 1-.282.406M16 13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9.77l3.49 2.09a1 1 0 0 0 1 0L16 9.77z"
          />
    </svg>
  );
});

IcRemotePush.displayName = 'IcRemotePush';
