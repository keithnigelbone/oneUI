import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMedicalHistory = forwardRef<SVGSVGElement, IconComponentProps>(function IcMedicalHistory(
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
            d="M14 14h-1v-1a1 1 0 0 0-2 0v1h-1a1 1 0 0 0 0 2h1v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 0-2m5.12-10.12A3 3 0 0 0 17 3h-1.28a2 2 0 0 0-.72-.73A2 2 0 0 0 14 2h-4a2 2 0 0 0-1 .27 2 2 0 0 0-.72.73H7a3 3 0 0 0-3 3v13a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V6a3 3 0 0 0-.88-2.12m-3.58 14.66a5 5 0 0 1-8.16-1.63A4.93 4.93 0 0 1 7.1 14a5 5 0 0 1 3.9-3.9 4.93 4.93 0 0 1 2.89.28 5 5 0 0 1 1.63 8.16zM18 8H6V6a1 1 0 0 1 1-1h1.28a2 2 0 0 0 .72.73A2 2 0 0 0 10 6h4a2 2 0 0 0 1-.27 2 2 0 0 0 .72-.73H17a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcMedicalHistory.displayName = 'IcMedicalHistory';
