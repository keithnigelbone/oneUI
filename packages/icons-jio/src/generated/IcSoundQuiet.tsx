import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSoundQuiet = forwardRef<SVGSVGElement, IconComponentProps>(function IcSoundQuiet(
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
            d="M13.8 4.4 9 8H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2l4.8 3.6A2 2 0 0 0 17 18V6a2 2 0 0 0-3.2-1.6"
          />
    </svg>
  );
});

IcSoundQuiet.displayName = 'IcSoundQuiet';
