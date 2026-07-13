import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSecurityCameraCeiling = forwardRef<SVGSVGElement, IconComponentProps>(function IcSecurityCameraCeiling(
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
            d="M20.41 3.59A2 2 0 0 0 19 3H5a2 2 0 0 0 0 4h14a2 2 0 0 0 1.41-3.41M18 9H6a1 1 0 0 0-1 1v4a7 7 0 1 0 14 0v-4a1 1 0 0 0-1-1m-3.88 8.12A3 3 0 0 1 12 18a3 3 0 0 1-.584-5.941A3 3 0 0 1 15 15a3 3 0 0 1-.88 2.12M12 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcSecurityCameraCeiling.displayName = 'IcSecurityCameraCeiling';
