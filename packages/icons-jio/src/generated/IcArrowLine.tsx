import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArrowLine = forwardRef<SVGSVGElement, IconComponentProps>(function IcArrowLine(
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
            d="M20 15c-.55 0-1 .45-1 1v1.59L4.71 3.29A.996.996 0 1 0 3.3 4.7l14.29 14.29H16c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"
          />
    </svg>
  );
});

IcArrowLine.displayName = 'IcArrowLine';
