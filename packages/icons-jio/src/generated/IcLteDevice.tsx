import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLteDevice = forwardRef<SVGSVGElement, IconComponentProps>(function IcLteDevice(
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
            d="M21.12 4.88A3 3 0 0 0 19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-.88-2.12M12 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m5-8H7a1 1 0 0 1 0-2h10a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcLteDevice.displayName = 'IcLteDevice';
