import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWaterPurifier = forwardRef<SVGSVGElement, IconComponentProps>(function IcWaterPurifier(
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
            d="M15 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2m5.16-2a1 1 0 0 0-1.15.83l-.72 4.32a1 1 0 0 1-1 .84h-2.6a1 1 0 0 1-1-.84L13 13.84a1.013 1.013 0 1 0-2 .32l.73 4.33A3 3 0 0 0 14.69 21h2.62a3 3 0 0 0 3-2.51l.69-4.33a1 1 0 0 0-.84-1.16M17 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m1-10H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h9a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2h1a1 1 0 0 0 1-1V6a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcWaterPurifier.displayName = 'IcWaterPurifier';
