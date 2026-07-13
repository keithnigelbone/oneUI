import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGoBack10 = forwardRef<SVGSVGElement, IconComponentProps>(function IcGoBack10(
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
            d="M10.5 15a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.31-.46.47.47 0 0 0-.54.11l-1 1a.495.495 0 1 0 .7.7l.15-.14v1.79a.5.5 0 0 0 .5.5m4.5-1.5v-1a1.5 1.5 0 1 0-3 0v1a1.5 1.5 0 1 0 3 0m-2 0v-1a.5.5 0 0 1 1 0v1a.5.5 0 0 1-1 0M12.39 5l.32-.31A1.005 1.005 0 0 0 12 2.976c-.266 0-.522.106-.71.294l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095L12.44 7A6 6 0 1 1 6 13a1 1 0 1 0-2 0 8 8 0 1 0 8.39-8"
          />
    </svg>
  );
});

IcGoBack10.displayName = 'IcGoBack10';
