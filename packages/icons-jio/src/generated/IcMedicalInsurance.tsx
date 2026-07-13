import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMedicalInsurance = forwardRef<SVGSVGElement, IconComponentProps>(function IcMedicalInsurance(
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
            d="M14 11h-1v-1a1 1 0 0 0-2 0v1h-1a1 1 0 0 0 0 2h1v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 0-2m6.46-6.32a2 2 0 0 0-1.3-.68 18.8 18.8 0 0 1-6.34-1.83 1.86 1.86 0 0 0-1.64 0A18.5 18.5 0 0 1 4.88 4 2.06 2.06 0 0 0 3 6v5c0 6.74 6.75 11 9 11s9-4.25 9-11V6a2 2 0 0 0-.54-1.32m-4.92 10.86a5 5 0 0 1-8.16-1.63A4.93 4.93 0 0 1 7.1 11 5 5 0 0 1 11 7.1a4.93 4.93 0 0 1 2.89.28 5 5 0 0 1 1.63 8.16z"
          />
    </svg>
  );
});

IcMedicalInsurance.displayName = 'IcMedicalInsurance';
