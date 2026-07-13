import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPairingComplete = forwardRef<SVGSVGElement, IconComponentProps>(function IcPairingComplete(
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
            d="M16 6H8a6 6 0 1 0 0 12h8a6 6 0 1 0 0-12m0 7H8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcPairingComplete.displayName = 'IcPairingComplete';
