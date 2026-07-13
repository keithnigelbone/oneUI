import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAccessories = forwardRef<SVGSVGElement, IconComponentProps>(function IcAccessories(
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
            d="M21 11h-.14a4.1 4.1 0 0 0-1.13-1.91 4 4 0 0 0-5.93.52 2.89 2.89 0 0 0-3.6 0 4 4 0 0 0-5.93-.52A4.1 4.1 0 0 0 3.14 11H3a1 1 0 0 0-.71.3 1 1 0 0 0 0 1.42A1 1 0 0 0 3 13h.14a4 4 0 0 0 4.37 3A4 4 0 0 0 11 12a1 1 0 1 1 2 0 4 4 0 0 0 3.49 4 4 4 0 0 0 4.37-3H21a1 1 0 0 0 .71-.3 1 1 0 0 0 0-1.42A1 1 0 0 0 21 11"
          />
    </svg>
  );
});

IcAccessories.displayName = 'IcAccessories';
