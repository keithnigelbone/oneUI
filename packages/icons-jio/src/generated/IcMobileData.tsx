import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMobileData = forwardRef<SVGSVGElement, IconComponentProps>(function IcMobileData(
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
            d="M10.38 3.08a1 1 0 0 0-1.09.21l-6 6a1.004 1.004 0 0 0 1.42 1.42L9 6.41V20a1 1 0 1 0 2 0V4a1 1 0 0 0-.62-.92m10.33 10.21a1 1 0 0 0-1.42 0L15 17.59V4a1 1 0 0 0-2 0v16a1 1 0 0 0 .62.92.84.84 0 0 0 .38.08 1 1 0 0 0 .71-.29l6-6a1 1 0 0 0 0-1.42"
          />
    </svg>
  );
});

IcMobileData.displayName = 'IcMobileData';
