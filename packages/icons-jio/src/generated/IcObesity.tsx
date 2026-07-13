import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcObesity = forwardRef<SVGSVGElement, IconComponentProps>(function IcObesity(
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
            d="M4.53 15.51c-.54 1.32-1.07 3.67.55 6.05.19.27.5.44.83.44h5.1v-2.56q-.345-.105-.66-.3l-5.81-3.63zm14.74-.47-5.59 4c-.21.15-.44.26-.67.35V22h5.1c.33 0 .64-.16.83-.44 1.83-2.7.91-5.36.34-6.52zM5.91 14H5.9l5.51 3.44c.35.21.78.2 1.11-.03L17.29 14H5.9zm.21-2H17.9c1 0 1.92-.68 2.08-1.66.17-1.03-.45-1.94-1.35-2.24-.39-.13-.62-.53-.62-.94V3c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v4.16c0 .41-.24.81-.62.94-.9.3-1.52 1.21-1.35 2.24.16.98 1.09 1.66 2.08 1.66zm5.89-5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1"
          />
    </svg>
  );
});

IcObesity.displayName = 'IcObesity';
