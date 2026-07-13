import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDarkLight = forwardRef<SVGSVGElement, IconComponentProps>(function IcDarkLight(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 18A8 8 0 0 1 9.69 4.35a10 10 0 0 0 7.74 13.53A8 8 0 0 1 12 20"
          />
    </svg>
  );
});

IcDarkLight.displayName = 'IcDarkLight';
