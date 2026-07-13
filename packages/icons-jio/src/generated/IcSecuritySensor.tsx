import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSecuritySensor = forwardRef<SVGSVGElement, IconComponentProps>(function IcSecuritySensor(
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
            d="M18.67 4.56a10 10 0 0 0-13.34 0 1.002 1.002 0 0 0 1.34 1.49 8 8 0 0 1 10.66 0 1 1 0 0 0 .67.25 1 1 0 0 0 .74-.3 1 1 0 0 0-.07-1.44m-2.38 6.65a11.2 11.2 0 0 1-3.8-1.1 1.15 1.15 0 0 0-1 0c-1.184.59-2.464.963-3.78 1.1a1.22 1.22 0 0 0-.79.39 1.18 1.18 0 0 0-.33.81v3c0 4 4 6.59 5.39 6.59s5.39-2.55 5.39-6.59v-3a1.16 1.16 0 0 0-.32-.79 1.2 1.2 0 0 0-.76-.41M9.61 8.82a4 4 0 0 1 4.78 0 1.002 1.002 0 1 0 1.22-1.59 6 6 0 0 0-7.22 0 1.002 1.002 0 1 0 1.22 1.59"
          />
    </svg>
  );
});

IcSecuritySensor.displayName = 'IcSecuritySensor';
