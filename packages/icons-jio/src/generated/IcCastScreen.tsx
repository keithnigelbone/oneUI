import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCastScreen = forwardRef<SVGSVGElement, IconComponentProps>(function IcCastScreen(
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
            d="M12.71 14.29a1 1 0 0 0-1.42 0l-4 4a1 1 0 0 0-.21 1.09A1 1 0 0 0 8 20h8a1 1 0 0 0 .92-.62 1 1 0 0 0-.21-1.09zM19 5H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3 1 1 0 0 0 0-2 1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1 1 1 0 0 0 0 2 3 3 0 0 0 3-3V8a3 3 0 0 0-3-3"
          />
    </svg>
  );
});

IcCastScreen.displayName = 'IcCastScreen';
