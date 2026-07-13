import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAccountClose = forwardRef<SVGSVGElement, IconComponentProps>(function IcAccountClose(
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
            d="M7.81 9.7c.55.55 1.23.94 1.97 1.15a4.5 4.5 0 0 0 2.36.02c.77-.2 1.48-.61 2.05-1.17.57-.57.97-1.27 1.17-2.05.2-.77.2-1.59-.02-2.36-.2-.75-.6-1.43-1.15-1.97-.55-.55-1.23-.94-1.97-1.15a4.5 4.5 0 0 0-2.36-.02c-.77.2-1.48.61-2.05 1.17s-.97 1.27-1.17 2.05c-.2.77-.2 1.59.02 2.36.2.75.6 1.43 1.15 1.97M14.42 12.77A7.998 7.998 0 0 0 3 20v.03C3 21.12 3.88 22 4.97 22h7.05A6.5 6.5 0 0 1 11 18.5c0-2.48 1.38-4.63 3.42-5.73M18.92 18.5l1.79-1.79c.39-.39.39-1.03 0-1.42a.996.996 0 0 0-1.41 0l-1.8 1.8-1.79-1.8a.996.996 0 0 0-1.41 0c-.39.39-.39 1.03 0 1.42l1.79 1.79-1.79 1.79c-.39.39-.39 1.03 0 1.42a1 1 0 0 0 1.41 0l1.79-1.8 1.8 1.8a1 1 0 0 0 1.41 0c.39-.39.39-1.03 0-1.42z"
          />
    </svg>
  );
});

IcAccountClose.displayName = 'IcAccountClose';
