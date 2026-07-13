import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcJewelleryRing = forwardRef<SVGSVGElement, IconComponentProps>(function IcJewelleryRing(
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
            d="m13.25 6.11 1.29-1.44a1 1 0 0 0 0-1.34l-.9-1A1 1 0 0 0 12.9 2h-1.8a1 1 0 0 0-.74.33l-.9 1a1 1 0 0 0 0 1.34l1.29 1.44a8 8 0 1 0 2.5 0M12 20a6 6 0 1 1 0-12 6 6 0 0 1 0 12"
          />
    </svg>
  );
});

IcJewelleryRing.displayName = 'IcJewelleryRing';
