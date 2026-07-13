import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMoonWaning46Gibbous = forwardRef<SVGSVGElement, IconComponentProps>(function IcMoonWaning46Gibbous(
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
            d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10m8-10c0 4.41-3.59 8-8 8h-.03c2.44-1.82 4.03-4.72 4.03-8s-1.59-6.18-4.03-8H12c4.41 0 8 3.59 8 8"
          />
    </svg>
  );
});

IcMoonWaning46Gibbous.displayName = 'IcMoonWaning46Gibbous';
