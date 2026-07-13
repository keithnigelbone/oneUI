import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCameraFocus = forwardRef<SVGSVGElement, IconComponentProps>(function IcCameraFocus(
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
            d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m9 3h-1.07A8 8 0 0 0 13 4.07V3a1 1 0 0 0-2 0v1.07A8 8 0 0 0 4.07 11H3a1 1 0 0 0 0 2h1.07A8 8 0 0 0 11 19.93V21a1 1 0 0 0 2 0v-1.07A8 8 0 0 0 19.93 13H21a1 1 0 0 0 0-2m-9 7a6 6 0 1 1 0-12 6 6 0 0 1 0 12"
          />
    </svg>
  );
});

IcCameraFocus.displayName = 'IcCameraFocus';
