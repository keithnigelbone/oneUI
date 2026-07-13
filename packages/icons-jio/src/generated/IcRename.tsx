import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRename = forwardRef<SVGSVGElement, IconComponentProps>(function IcRename(
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
            d="M10.43 4.63a1 1 0 0 0-1.86 0l-5.5 14a1 1 0 0 0 0 .77c.11.24.307.429.55.53a1 1 0 0 0 .77 0c.24-.11.429-.307.53-.55L6.65 15h5.7l1.72 4.37a1 1 0 0 0 .21.32 1 1 0 0 0 .32.23 1.07 1.07 0 0 0 .79.01 1 1 0 0 0 .32-.21 1 1 0 0 0 .23-.32A1 1 0 0 0 16 19a1.1 1.1 0 0 0-.07-.39zm-3 8.37L9.5 7.73 11.57 13zM19 3a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcRename.displayName = 'IcRename';
