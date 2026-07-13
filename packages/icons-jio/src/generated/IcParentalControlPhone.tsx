import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcParentalControlPhone = forwardRef<SVGSVGElement, IconComponentProps>(function IcParentalControlPhone(
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
            d="M19 5.28V5a3 3 0 0 0-6 0v.27A2 2 0 0 0 12 7v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7a2 2 0 0 0-1-1.72M16 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-1-5a1 1 0 0 1 2 0zm-5 6V6a5.93 5.93 0 0 1 1.54-4H9a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-4h-4a4 4 0 0 1-4-4m2 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcParentalControlPhone.displayName = 'IcParentalControlPhone';
