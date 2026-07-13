import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGardenTools = forwardRef<SVGSVGElement, IconComponentProps>(function IcGardenTools(
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
            d="M13 9c0-2.76-3-6-5-6S3 6.24 3 9v3a1 1 0 0 0 1 1h3v2.28A2 2 0 0 0 6 17v2a2 2 0 0 0 4 0v-2a2 2 0 0 0-1-1.72V13h3a1 1 0 0 0 1-1zm5 4v-2.28A2 2 0 0 0 19 9V5a2 2 0 1 0-4 0v4a2 2 0 0 0 1 1.72V13a3 3 0 0 0-3 3v4a1 1 0 0 0 2 0v-4a1 1 0 0 1 1-1v5a1 1 0 0 0 2 0v-5a1 1 0 0 1 1 1v4a1 1 0 0 0 2 0v-4a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcGardenTools.displayName = 'IcGardenTools';
