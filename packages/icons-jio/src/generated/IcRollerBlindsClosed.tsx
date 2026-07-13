import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRollerBlindsClosed = forwardRef<SVGSVGElement, IconComponentProps>(function IcRollerBlindsClosed(
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
            d="M19.5 12h-15a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5m.5-2.5a.5.5 0 0 0-.5-.5h-15a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5zM4 5h16a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m16 14h-1v-2.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V19h-2v-2.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V19H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2m0-12.5a.5.5 0 0 0-.5-.5h-15a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5z"
          />
    </svg>
  );
});

IcRollerBlindsClosed.displayName = 'IcRollerBlindsClosed';
