import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTrash = forwardRef<SVGSVGElement, IconComponentProps>(function IcTrash(
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
                d='M20 6h-2V5a3 3 0 00-3-3H9a3 3 0 00-3 3v1H4a1 1 0 000 2h1v11a3 3 0 003 3h8a3 3 0 003-3V8h1a1 1 0 100-2zM9 18a1 1 0 11-2 0v-7a1 1 0 112 0v7zm4 0a1 1 0 01-2 0v-7a1 1 0 012 0v7zm4 0a1 1 0 01-2 0v-7a1 1 0 012 0v7zM8 5a1 1 0 011-1h6a1 1 0 011 1v1H8V5z'
                fill='currentColor'
              />
    </svg>
  );
});

IcTrash.displayName = 'IcTrash';
