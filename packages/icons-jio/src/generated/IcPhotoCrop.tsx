import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPhotoCrop = forwardRef<SVGSVGElement, IconComponentProps>(function IcPhotoCrop(
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
            d="M8.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M18 3h-3a1 1 0 1 0 0 2h3a1 1 0 0 1 1 1v3a1 1 0 0 0 2 0V6a3 3 0 0 0-3-3M4 10a1 1 0 0 0 1-1V6a1 1 0 0 1 1-1h3a1 1 0 0 0 0-2H6a3 3 0 0 0-3 3v3a1 1 0 0 0 1 1m12.21-.71a1 1 0 0 0-1.41 0l-4.29 4.3-1.29-1.3a1 1 0 0 0-1.41 0L5 15.09V15a1 1 0 1 0-2 0v3a3 3 0 0 0 3 3h3a1 1 0 0 0 0-2H6a1 1 0 0 1-1-1v-.09l3.5-3.5 1.29 1.3a1 1 0 0 0 1.41 0l4.29-4.3 3.5 3.5V18a1 1 0 0 1-1 1H15a1 1 0 0 0 0 2h3a3 3 0 0 0 3-3v-3.5a1 1 0 0 0-.29-.71z"
          />
    </svg>
  );
});

IcPhotoCrop.displayName = 'IcPhotoCrop';
