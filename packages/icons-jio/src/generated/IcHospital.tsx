import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHospital = forwardRef<SVGSVGElement, IconComponentProps>(function IcHospital(
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
            d="m20.06 7.68-7-4.38a2 2 0 0 0-2.12 0l-7 4.38A2 2 0 0 0 3 9.37V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9.37a2 2 0 0 0-.94-1.69M15 14h-2v2a1 1 0 0 1-2 0v-2H9a1 1 0 0 1 0-2h2v-2a1 1 0 0 1 2 0v2h2a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcHospital.displayName = 'IcHospital';
