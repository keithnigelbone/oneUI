import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNextTitle = forwardRef<SVGSVGElement, IconComponentProps>(function IcNextTitle(
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
            d="m16.2 10.4-8-6A2 2 0 0 0 5 6v12a2 2 0 0 0 3.2 1.6l8-6a2 2 0 0 0 0-3.2M18 4a1 1 0 0 0-1 1v14a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcNextTitle.displayName = 'IcNextTitle';
