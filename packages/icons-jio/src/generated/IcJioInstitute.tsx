import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcJioInstitute = forwardRef<SVGSVGElement, IconComponentProps>(function IcJioInstitute(
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
            d="M20 12h-3.1A5 5 0 0 0 13 8.1V7h2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v4.1A5 5 0 0 0 7.1 12H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h6v-4a2 2 0 0 1 4 0v4h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1m-8 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcJioInstitute.displayName = 'IcJioInstitute';
