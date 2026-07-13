import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEsports = forwardRef<SVGSVGElement, IconComponentProps>(function IcEsports(
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
            d="M20.46 4.68c-.34-.37-.8-.6-1.3-.66-2.2-.23-4.35-.85-6.34-1.83-.26-.13-.54-.19-.82-.19s-.56.07-.82.19c-1.97.98-4.11 1.6-6.3 1.83-.5.04-.97.27-1.32.64s-.55.85-.56 1.36v4.99C3 17.75 9.75 22 12 22s9-4.25 9-10.99V6.02c-.01-.5-.2-.97-.54-1.34m-6.94 5.82c.55 0 1 .45 1 1s-.45 1-1 1H10.5v2h4c.55 0 1 .45 1 1s-.45 1-1 1h-5c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1h5c.55 0 1 .45 1 1s-.45 1-1 1h-4v2z"
          />
    </svg>
  );
});

IcEsports.displayName = 'IcEsports';
