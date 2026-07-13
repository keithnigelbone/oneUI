import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcKidsroom = forwardRef<SVGSVGElement, IconComponentProps>(function IcKidsroom(
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
            d="M20 4a1 1 0 0 0-1 1v1H5V5a1 1 0 0 0-2 0v14.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V18h14v1.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V5a1 1 0 0 0-1-1M7 14H5V8h2zm4 0H9V8h2zm4 0h-2V8h2zm4 0h-2V8h2z"
          />
    </svg>
  );
});

IcKidsroom.displayName = 'IcKidsroom';
