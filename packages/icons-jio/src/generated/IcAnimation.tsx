import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAnimation = forwardRef<SVGSVGElement, IconComponentProps>(function IcAnimation(
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
            d="M20.53 4.47a4.51 4.51 0 0 0-6.36-.3A4 4 0 0 0 13 7.08a6.5 6.5 0 0 0-2 0 4 4 0 0 0-1.17-2.91 4.51 4.51 0 0 0-6.36.3 4.51 4.51 0 0 0-.3 6.36 4 4 0 0 0 2.14 1.09A7.2 7.2 0 0 0 5 14a7 7 0 1 0 14 0c0-.705-.105-1.406-.31-2.08a4 4 0 0 0 2.14-1.09 4.51 4.51 0 0 0-.3-6.36"
          />
    </svg>
  );
});

IcAnimation.displayName = 'IcAnimation';
