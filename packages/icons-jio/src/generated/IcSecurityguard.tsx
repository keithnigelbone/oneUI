import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSecurityguard = forwardRef<SVGSVGElement, IconComponentProps>(function IcSecurityguard(
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
            d="M7.29 4.71A1 1 0 0 0 8 5h8a1 1 0 0 0 .71-.29l1-1a1 1 0 0 0 .21-1.09A1 1 0 0 0 17 2H7a1 1 0 0 0-.92.62 1 1 0 0 0 .21 1.09zm7.18 7.68-1.9 1.41a1 1 0 0 1-1.2 0l-1.88-1.39A8 8 0 0 0 4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-5.53-7.61M16 20a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-4-9a4.48 4.48 0 0 0 4.45-4h-8.9A4.48 4.48 0 0 0 12 11"
          />
    </svg>
  );
});

IcSecurityguard.displayName = 'IcSecurityguard';
