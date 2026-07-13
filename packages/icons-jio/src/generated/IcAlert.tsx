import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAlert = forwardRef<SVGSVGElement, IconComponentProps>(function IcAlert(
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
            d="m21.74 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.74-3M11 7a1 1 0 0 1 2 0v6a1 1 0 1 1-2 0zm1 12a1.5 1.5 0 1 1 0-2.999 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcAlert.displayName = 'IcAlert';
