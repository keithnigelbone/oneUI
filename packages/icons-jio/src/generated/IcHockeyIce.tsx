import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHockeyIce = forwardRef<SVGSVGElement, IconComponentProps>(function IcHockeyIce(
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
            d="M4.5 14h3A1.5 1.5 0 0 0 9 12.5v-1A1.5 1.5 0 0 0 7.5 10h-3A1.5 1.5 0 0 0 3 11.5v1A1.5 1.5 0 0 0 4.5 14m16-10.89a1 1 0 0 0-1.1.132 1 1 0 0 0-.24.308L12.88 16H5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h5.76a3 3 0 0 0 2.69-1.66l7.44-14.89a1 1 0 0 0 .11-.76 1 1 0 0 0-.5-.58"
          />
    </svg>
  );
});

IcHockeyIce.displayName = 'IcHockeyIce';
