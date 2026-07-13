import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcJewelleryDiamond = forwardRef<SVGSVGElement, IconComponentProps>(function IcJewelleryDiamond(
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
            d="m21.14 8.66-3.6-4A2 2 0 0 0 16.05 4H8a2 2 0 0 0-1.49.66l-3.6 4a2 2 0 0 0 0 2.68l8.4 9.33a1 1 0 0 0 1.48 0l8.4-9.33a2 2 0 0 0-.05-2.68"
          />
    </svg>
  );
});

IcJewelleryDiamond.displayName = 'IcJewelleryDiamond';
