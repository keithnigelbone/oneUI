import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBluetooth = forwardRef<SVGSVGElement, IconComponentProps>(function IcBluetooth(
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
            d="M19 16.59v-.15a1.4 1.4 0 0 0-.07-.29v-.12a1.1 1.1 0 0 0-.28-.33L13.67 12l4.93-3.7a1.1 1.1 0 0 0 .28-.3v-.12a1.4 1.4 0 0 0 .12-.32v-.15a1.3 1.3 0 0 0-.06-.27 1 1 0 0 0-.1-.14.4.4 0 0 0 0-.09 1 1 0 0 0-.13-.11s0-.07-.07-.09l-6-4.5A1 1 0 0 0 11 3v7L6.6 6.7a1 1 0 1 0-1.2 1.6l4.93 3.7-4.93 3.7a1 1 0 1 0 1.2 1.6L11 14v7a1 1 0 0 0 .55.89 1 1 0 0 0 1-.09l6-4.5s.06-.08.09-.11.08-.05.11-.09a.4.4 0 0 0 0-.09q.045-.072.08-.15a1.3 1.3 0 0 0 .17-.27M13 5l3.33 2.5L13 10zm0 14v-5l3.33 2.5z"
          />
    </svg>
  );
});

IcBluetooth.displayName = 'IcBluetooth';
