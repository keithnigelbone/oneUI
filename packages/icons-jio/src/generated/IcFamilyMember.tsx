import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFamilyMember = forwardRef<SVGSVGElement, IconComponentProps>(function IcFamilyMember(
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
            d="M7 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m5 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m5-7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m2.72 1.93A3.8 3.8 0 0 0 17 9c-.61 0-1.213.13-1.77.38a4.44 4.44 0 0 1 .35 5.81A6 6 0 0 1 18 20c0 .341-.06.68-.18 1H19a1.91 1.91 0 0 0 2-1.83V12.5a3.78 3.78 0 0 0-1.28-2.57m-12.21 2.3a4.4 4.4 0 0 1 1.26-2.84A4.3 4.3 0 0 0 7 9a3.76 3.76 0 0 0-4 3.5v6.67A1.91 1.91 0 0 0 5 21h1.18A2.9 2.9 0 0 1 6 20a6 6 0 0 1 2.42-4.8 4.4 4.4 0 0 1-.91-2.97M12 16a4 4 0 0 0-4 4 1 1 0 0 0 1 1h6a1 1 0 0 0 1-1 4 4 0 0 0-4-4"
          />
    </svg>
  );
});

IcFamilyMember.displayName = 'IcFamilyMember';
