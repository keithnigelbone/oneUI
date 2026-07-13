import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcProtectionThreats = forwardRef<SVGSVGElement, IconComponentProps>(function IcProtectionThreats(
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
            d="M20.46 4.68a2 2 0 0 0-1.3-.68 18.8 18.8 0 0 1-6.34-1.83 1.86 1.86 0 0 0-1.64 0A18.5 18.5 0 0 1 4.88 4 2.06 2.06 0 0 0 3 6v5c0 6.74 6.75 11 9 11s9-4.25 9-11V6a2 2 0 0 0-.54-1.32M11 6.5a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0zm2.06 11.56a1.5 1.5 0 0 1-2.45-.49 1.5 1.5 0 0 1-.08-.86 1.49 1.49 0 0 1 1.18-1.18 1.5 1.5 0 0 1 .86.08 1.5 1.5 0 0 1 .49 2.45"
          />
    </svg>
  );
});

IcProtectionThreats.displayName = 'IcProtectionThreats';
