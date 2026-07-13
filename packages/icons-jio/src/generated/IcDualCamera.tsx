import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDualCamera = forwardRef<SVGSVGElement, IconComponentProps>(function IcDualCamera(
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
            d="M12 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2m0-13a6 6 0 0 0-6 6v8a6 6 0 1 0 12 0V8a6 6 0 0 0-6-6m0 17a3 3 0 1 1 0-5.999A3 3 0 0 1 12 19m0-8a3 3 0 1 1 0-5.999A3 3 0 0 1 12 11m0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcDualCamera.displayName = 'IcDualCamera';
