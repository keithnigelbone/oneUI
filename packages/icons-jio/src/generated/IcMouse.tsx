import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMouse = forwardRef<SVGSVGElement, IconComponentProps>(function IcMouse(
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
            d="M12 2a6 6 0 0 0-6 6v8a6 6 0 1 0 12 0V8a6 6 0 0 0-6-6m1 6a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcMouse.displayName = 'IcMouse';
