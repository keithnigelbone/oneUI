import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHellojio = forwardRef<SVGSVGElement, IconComponentProps>(function IcHellojio(
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
            d="M16.5 12c2.49 0 4.5-2.01 4.5-4.5S18.99 3 16.5 3 12 5.01 12 7.5s2.01 4.5 4.5 4.5M12 7.5C12 5.01 9.99 3 7.5 3S3 5.01 3 7.5 5.01 12 7.5 12 12 9.99 12 7.5m4.5 4.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5m-9 0C5.01 12 3 14.01 3 16.5S5.01 21 7.5 21s4.5-2.01 4.5-4.5S9.99 12 7.5 12"
          />
    </svg>
  );
});

IcHellojio.displayName = 'IcHellojio';
