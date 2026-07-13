import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcIntercomCallMobile = forwardRef<SVGSVGElement, IconComponentProps>(function IcIntercomCallMobile(
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
            d="M8 5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v.56A3.9 3.9 0 0 1 4 5zm0 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M6 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2M21.12 4.88A3 3 0 0 0 19 4H9v1.14a4 4 0 0 1 2.52 2A1 1 0 0 1 12 7h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-6v2a1 1 0 0 1 0 2v1a1 1 0 0 1 0 2v1a4 4 0 0 1-.14 1H19a3 3 0 0 0 3-3V7a3 3 0 0 0-.88-2.12M15 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcIntercomCallMobile.displayName = 'IcIntercomCallMobile';
