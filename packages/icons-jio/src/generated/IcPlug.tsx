import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlug = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlug(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m5 12a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-4a1 1 0 0 1 1-1h1V7a1 1 0 0 1 2 0v2h2V7a1 1 0 0 1 2 0v2h1a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcPlug.displayName = 'IcPlug';
