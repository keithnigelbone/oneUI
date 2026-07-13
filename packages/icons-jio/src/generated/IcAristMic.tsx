import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAristMic = forwardRef<SVGSVGElement, IconComponentProps>(function IcAristMic(
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
            d="M16 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10M9.25 9.81l-4.68 6.43a3 3 0 0 0 4.44 4l5.91-5.32a7 7 0 0 1-5.67-5.11M9 16.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcAristMic.displayName = 'IcAristMic';
