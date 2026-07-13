import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPauseCircle = forwardRef<SVGSVGElement, IconComponentProps>(function IcPauseCircle(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-1 13a1.5 1.5 0 1 1-3 0V9a1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0V9a1.5 1.5 0 1 1 3 0z"
          />
    </svg>
  );
});

IcPauseCircle.displayName = 'IcPauseCircle';
