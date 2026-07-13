import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAperture = forwardRef<SVGSVGElement, IconComponentProps>(function IcAperture(
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
            fillRule="evenodd"
            d="M20.11 6.16 15.5 8.82a.996.996 0 0 0 0 1.73l6.26 3.61c.15-.7.24-1.42.24-2.17 0-2.18-.71-4.19-1.89-5.84zM12.5 8.24l6.26-3.61A9.97 9.97 0 0 0 11 2.06v5.32c0 .77.83 1.25 1.5.87zM9 9.68V2.47c-.68.22-1.35.5-2 .87A9.93 9.93 0 0 0 2.89 7.9l4.61 2.66c.67.38 1.5-.1 1.5-.87zm-.5 3.75L2.24 9.82c-.15.7-.24 1.42-.24 2.17 0 2.18.71 4.19 1.89 5.84l4.61-2.66a.996.996 0 0 0 0-1.73zm3 2.31-6.26 3.61A9.97 9.97 0 0 0 13 21.92V16.6c0-.77-.83-1.25-1.5-.87zM15 14.3v7.23c.68-.22 1.35-.5 2-.87a9.93 9.93 0 0 0 4.11-4.56l-4.61-2.66c-.67-.38-1.5.1-1.5.87z"
            clipRule="evenodd"
          />
    </svg>
  );
});

IcAperture.displayName = 'IcAperture';
