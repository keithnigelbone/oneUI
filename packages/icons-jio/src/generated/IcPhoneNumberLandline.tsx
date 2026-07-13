import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPhoneNumberLandline = forwardRef<SVGSVGElement, IconComponentProps>(function IcPhoneNumberLandline(
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
            d="M20.6 6.4C19.72 5.28 17.29 3 12 3S4.28 5.28 3.4 6.4A1.93 1.93 0 0 0 3 7.6V9a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7.6a1.93 1.93 0 0 0-.4-1.2M18 13a4 4 0 0 1-4-4h-4a4 4 0 0 1-4 4 2 2 0 0 0-2 2v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3a2 2 0 0 0-2-2m-9 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcPhoneNumberLandline.displayName = 'IcPhoneNumberLandline';
