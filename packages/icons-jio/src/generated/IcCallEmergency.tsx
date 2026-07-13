import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCallEmergency = forwardRef<SVGSVGElement, IconComponentProps>(function IcCallEmergency(
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
            d="M15.62 15.86c-.78-.78-2.05-.78-2.83 0l-.71.71c-.71.71-1.41 0-1.41 0l-4.24-4.24c-.71-.71 0-1.41 0-1.41l.71-.71c.78-.78.78-2.05 0-2.83l-.71-.71c-.78-.78-2.05-.78-2.83 0l-.99.99c-.31.31-.51.7-.57 1.14-.17 1.41-.06 4.74 3.68 8.48s7.08 3.85 8.48 3.68c.43-.05.83-.26 1.14-.57l.99-.99c.78-.78.78-2.05 0-2.83zM16.5 2C13.46 2 11 4.46 11 7.5V13h5.5c3.04 0 5.5-2.46 5.5-5.5S19.54 2 16.5 2m3 6c0 .28-.22.5-.5.5h-1.5V10c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5V8.5H14c-.28 0-.5-.22-.5-.5V7c0-.28.22-.5.5-.5h1.5V5c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v1.5H19c.28 0 .5.22.5.5z"
          />
    </svg>
  );
});

IcCallEmergency.displayName = 'IcCallEmergency';
