import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRollerBlinds = forwardRef<SVGSVGElement, IconComponentProps>(function IcRollerBlinds(
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
            d="M4 5h1v5.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V5h2v5.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V5h1a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m16 14h-1v-5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V19h-2v-5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V19H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcRollerBlinds.displayName = 'IcRollerBlinds';
