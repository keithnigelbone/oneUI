import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlayCircle = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlayCircle(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.66 11.1-4.24 3.27A1.5 1.5 0 0 1 9 15.18V8.64a1.5 1.5 0 0 1 2.42-1.19l4.24 3.27a1.5 1.5 0 0 1 0 2.38"
          />
    </svg>
  );
});

IcPlayCircle.displayName = 'IcPlayCircle';
