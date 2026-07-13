import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNextCircle = forwardRef<SVGSVGElement, IconComponentProps>(function IcNextCircle(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m4.71 10.71-3 3a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l1.3-1.29H8a1 1 0 0 1 0-2h5.59l-1.3-1.29a1.004 1.004 0 1 1 1.42-1.42l3 3a1 1 0 0 1 .21.33 1 1 0 0 1 0 .76 1 1 0 0 1-.21.33"
          />
    </svg>
  );
});

IcNextCircle.displayName = 'IcNextCircle';
