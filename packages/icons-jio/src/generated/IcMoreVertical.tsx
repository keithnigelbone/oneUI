import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoreVertical = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoreVertical(
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
            d="M12 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m0 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0-6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </svg>
  );
});

IcMoreVertical.displayName = 'IcMoreVertical';
