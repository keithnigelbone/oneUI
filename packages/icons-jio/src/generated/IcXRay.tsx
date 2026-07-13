import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcXRay = forwardRef<SVGSVGElement, IconComponentProps>(function IcXRay(
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
            d="M8 3H6C4.34 3 3 4.34 3 6v4.54A5.98 5.98 0 0 1 7 9h4V6.86c-1.72-.45-3-2-3-3.86M7 13h2c1.1 0 2-.9 2-2H7c-2.21 0-4 1.79-4 4v3c0 1.66 1.34 3 3 3h5v-2.56c-.59.34-1.27.56-2 .56H7c-.55 0-1-.45-1-1s.45-1 1-1h2c1.1 0 2-.9 2-2v-.56c-.59.34-1.27.56-2 .56H7c-.55 0-1-.45-1-1s.45-1 1-1m10-2h-4c0 1.1.9 2 2 2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.73 0-1.41-.21-2-.56V15c0 1.1.9 2 2 2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.73 0-1.41-.21-2-.56V21h5c1.66 0 3-1.34 3-3v-3c0-2.21-1.79-4-4-4m-3-8h-4c0 1.1.9 2 2 2s2-.9 2-2m4 0h-2c0 1.86-1.28 3.41-3 3.86V9h4c1.54 0 2.94.59 4 1.54V6c0-1.66-1.34-3-3-3"
          />
    </svg>
  );
});

IcXRay.displayName = 'IcXRay';
