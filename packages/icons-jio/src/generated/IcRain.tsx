import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRain = forwardRef<SVGSVGElement, IconComponentProps>(function IcRain(
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
            d="M19.91 11.15A4 4 0 0 0 16 8c-1.5 0-2.79.83-3.47 2.05A2.996 2.996 0 0 0 9 13c-1.1 0-2 .9-2 2s.9 2 2 2h10a2.996 2.996 0 0 0 .91-5.85m-8.38-3.13c.88-.99 2.07-1.66 3.36-1.91C14.48 4.33 12.9 3 11 3c-1.5 0-2.79.83-3.47 2.05A2.996 2.996 0 0 0 4 8c-1.1 0-2 .9-2 2s.9 2 2 2h2.36c.27-.24.58-.44.9-.6a5.03 5.03 0 0 1 4.27-3.38M9.2 18.4l-1.5 2c-.33.44-.24 1.07.2 1.4.18.13.39.2.6.2.3 0 .6-.14.8-.4l1.5-2c.33-.44.24-1.07-.2-1.4s-1.07-.24-1.4.2m4 0-1.5 2c-.33.44-.24 1.07.2 1.4.18.13.39.2.6.2.3 0 .6-.14.8-.4l1.5-2c.33-.44.24-1.07-.2-1.4s-1.07-.24-1.4.2m4 0-1.5 2c-.33.44-.24 1.07.2 1.4.18.13.39.2.6.2.3 0 .6-.14.8-.4l1.5-2c.33-.44.24-1.07-.2-1.4s-1.07-.24-1.4.2"
          />
    </svg>
  );
});

IcRain.displayName = 'IcRain';
