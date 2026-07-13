import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWar = forwardRef<SVGSVGElement, IconComponentProps>(function IcWar(
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
            d="M14 8h6a1 1 0 1 0 0-2h-6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4h9zm6.83 5.17A4 4 0 0 0 18 12H6a4 4 0 1 0 0 8h12a4 4 0 0 0 2.83-6.83M6.71 16.71a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45A1 1 0 0 1 5 15.8a1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm4 0a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45A1 1 0 0 1 9 15.8a1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm4 0a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.08-.58 1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm4 0a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.08-.58 1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27z"
          />
    </svg>
  );
});

IcWar.displayName = 'IcWar';
