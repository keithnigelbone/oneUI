import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWebcam = forwardRef<SVGSVGElement, IconComponentProps>(function IcWebcam(
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
            d="M5 4h14c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2m9 4c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2"
            clipRule="evenodd"
          />
          <path
            fill="currentColor"
            d="M12.77 11h-1.54c-.68 0-1.23.55-1.23 1.23v6.54c0 .68.55 1.23 1.23 1.23h1.54c.68 0 1.23-.55 1.23-1.23v-6.54c0-.68-.55-1.23-1.23-1.23"
          />
          <path
            fill="currentColor"
            d="M15.57 17H8.43C7.64 17 7 17.67 7 18.5S7.64 20 8.43 20h7.14c.79 0 1.43-.67 1.43-1.5s-.64-1.5-1.43-1.5"
          />
    </svg>
  );
});

IcWebcam.displayName = 'IcWebcam';
