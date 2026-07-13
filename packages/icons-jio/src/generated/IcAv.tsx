import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAv = forwardRef<SVGSVGElement, IconComponentProps>(function IcAv(
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
            d="M12 9c-1.6 0-3 1.4-3 3s1.4 3 3 3 3-1.4 3-3-1.4-3-3-3m0 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1m7-4c-1.6 0-3 1.4-3 3s1.4 3 3 3 3-1.4 3-3-1.4-3-3-3m0 4c-.5 0-1-.4-1-1s.5-1 1-1 1 .4 1 1-.5 1-1 1M5 9c-1.7 0-3 1.4-3 3s1.3 3 3 3 3-1.4 3-3-1.3-3-3-3m0 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1"
          />
    </svg>
  );
});

IcAv.displayName = 'IcAv';
