import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcShareScreen = forwardRef<SVGSVGElement, IconComponentProps>(function IcShareScreen(
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
            d="M19 4H5C3.34 4 2 5.34 2 7v10c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3m-3.29 7.71c-.2.2-.45.29-.71.29s-.51-.1-.71-.29L13 10.42v5.59c0 .55-.45 1-1 1s-1-.45-1-1v-5.59l-1.29 1.29c-.2.2-.45.29-.71.29s-.51-.1-.71-.29a.996.996 0 0 1 0-1.41l3-3a.996.996 0 0 1 1.41 0l3 3c.39.39.39 1.02 0 1.41z"
          />
    </svg>
  );
});

IcShareScreen.displayName = 'IcShareScreen';
