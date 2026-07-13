import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcChevronUpCircle = forwardRef<SVGSVGElement, IconComponentProps>(function IcChevronUpCircle(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m4.71 12.21a1 1 0 0 1-1.42 0L12 10.91l-3.29 3.3a1.005 1.005 0 0 1-1.42-1.42l4-4a1 1 0 0 1 1.42 0l4 4a1 1 0 0 1 0 1.42"
          />
    </svg>
  );
});

IcChevronUpCircle.displayName = 'IcChevronUpCircle';
