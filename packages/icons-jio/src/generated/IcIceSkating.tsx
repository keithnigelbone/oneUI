import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcIceSkating = forwardRef<SVGSVGElement, IconComponentProps>(function IcIceSkating(
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
            d="M17.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M20 17a1 1 0 0 0-1 1v1h-2v-5a1 1 0 0 0-.45-.83l-2.78-1.86 2-2.71a1 1 0 0 0 .09-1A1 1 0 0 0 15 7H8a1 1 0 0 0 0 2h5l-4.5 6H5v-2a1 1 0 1 0-2 0v6a2 2 0 0 0 2 2h1a1 1 0 0 0 0-2H5v-2h4a1 1 0 0 0 .8-.4l2.77-3.69L15 14.54V19h-2a1 1 0 0 0 0 2h6a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcIceSkating.displayName = 'IcIceSkating';
