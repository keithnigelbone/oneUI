import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEMail = forwardRef<SVGSVGElement, IconComponentProps>(function IcEMail(
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
            d="m12.59 11.34 8-5.85A3 3 0 0 0 19 5H5a3 3 0 0 0-1.63.49l8 5.85a1 1 0 0 0 1.22 0m9.25-4.26L13.76 13a3 3 0 0 1-3.52 0L2.16 7.08A2.8 2.8 0 0 0 2 8v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a2.8 2.8 0 0 0-.16-.92"
          />
    </svg>
  );
});

IcEMail.displayName = 'IcEMail';
