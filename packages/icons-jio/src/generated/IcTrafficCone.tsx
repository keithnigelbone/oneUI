import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTrafficCone = forwardRef<SVGSVGElement, IconComponentProps>(function IcTrafficCone(
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
            d="M14 3.7a1 1 0 0 0-1-.7h-2a1 1 0 0 0-.95.7L8.7 8h6.6zM20 19h-1.26l-.94-3H6.2l-.94 3H4a1 1 0 1 0 0 2h16a1 1 0 0 0 0-2m-4.08-9H8.08l-1.25 4h10.34z"
          />
    </svg>
  );
});

IcTrafficCone.displayName = 'IcTrafficCone';
