import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcIpCamera = forwardRef<SVGSVGElement, IconComponentProps>(function IcIpCamera(
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
            d="M12 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2m3 10h-2v-2.08a7 7 0 1 0-2 0V18H9a3 3 0 0 0-3 3 1 1 0 0 0 1 1h10a1 1 0 0 0 1-1 3 3 0 0 0-3-3M9 9a3 3 0 1 1 6 0 3 3 0 0 1-6 0"
          />
    </svg>
  );
});

IcIpCamera.displayName = 'IcIpCamera';
