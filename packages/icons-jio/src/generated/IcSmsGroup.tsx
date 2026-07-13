import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmsGroup = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmsGroup(
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
            d="M15 4H9a7 7 0 0 0-1 13.92V20a1.5 1.5 0 0 0 2.4 1.2l4.27-3.2H15a7 7 0 0 0 0-14m-1.67 3a1.34 1.34 0 1 1 .02 2.68A1.34 1.34 0 0 1 13.33 7m-3.55.89a1.34 1.34 0 1 1 0 2.68 1.34 1.34 0 0 1 0-2.68m5.33 6.22h-2.67a.88.88 0 0 1-.88.89H8a.89.89 0 0 1-.89-.89 2.68 2.68 0 0 1 2.67-2.67 2.6 2.6 0 0 1 1.3.36A2.67 2.67 0 0 1 16 13.22a.89.89 0 0 1-.89.89"
          />
    </svg>
  );
});

IcSmsGroup.displayName = 'IcSmsGroup';
