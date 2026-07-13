import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFullscreenModeOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcFullscreenModeOff(
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
                d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.5 14.5c0 .4-.24.77-.62.92a.995.995 0 01-1.09-.21l-3-3c-.29-.29-.37-.72-.22-1.09.15-.37.52-.62.92-.62h3c.55 0 1 .45 1 1v3h.01zm5.92-5.62c-.15.37-.52.62-.92.62h-3c-.55 0-1-.45-1-1v-3c0-.4.24-.77.62-.92.38-.16.8-.07 1.09.22l3 3c.29.29.37.72.22 1.09l-.01-.01z'
                fill='currentColor'
              />
    </svg>
  );
});

IcFullscreenModeOff.displayName = 'IcFullscreenModeOff';
