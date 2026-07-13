import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDataCircle = forwardRef<SVGSVGElement, IconComponentProps>(function IcDataCircle(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-1 13.75a1 1 0 0 1-2 0V11.1l-1.22 1.52a1 1 0 1 1-1.56-1.24l3-3.76a1 1 0 0 1 1.78.63zm6.78-3.13-3 3.76a1 1 0 0 1-1.594-.054A1 1 0 0 1 13 15.75v-7.5a1 1 0 0 1 2 0v4.65l1.22-1.52a1 1 0 0 1 1.56 1.24"
          />
    </svg>
  );
});

IcDataCircle.displayName = 'IcDataCircle';
