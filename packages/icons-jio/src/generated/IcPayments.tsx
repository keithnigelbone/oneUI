import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPayments = forwardRef<SVGSVGElement, IconComponentProps>(function IcPayments(
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
            d="M17.07 8.06h-1.82c-.12-.44-.29-.86-.5-1.25h2.32c.77 0 1.4-.63 1.4-1.4s-.63-1.4-1.4-1.4H6.93c-.77 0-1.4.63-1.4 1.4s.63 1.4 1.4 1.4h3.04c.92 0 1.77.48 2.25 1.25H6.93c-.77 0-1.4.63-1.4 1.4s.63 1.4 1.4 1.4h5.29c-.47.75-1.28 1.22-2.15 1.25H6.93c-.49 0-.93.25-1.19.66-.39.61-.23 1.43.35 1.87l8.11 6.08c.25.18.54.28.84.28.07 0 .13 0 .2-.01.37-.05.7-.25.92-.55s.32-.67.27-1.04-.25-.7-.55-.92l-4.87-3.65a5.51 5.51 0 0 0 4.24-3.96h1.82c.77 0 1.4-.63 1.4-1.4s-.63-1.4-1.4-1.4z"
          />
    </svg>
  );
});

IcPayments.displayName = 'IcPayments';
