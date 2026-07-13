import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEndChat = forwardRef<SVGSVGElement, IconComponentProps>(function IcEndChat(
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
            d="M16.88 7.12c.39.39 1.02.39 1.41 0l.71-.71.71.71a.996.996 0 1 0 1.41-1.41L20.41 5l.71-.71a.996.996 0 1 0-1.41-1.41l-.71.71-.71-.71a.996.996 0 1 0-1.41 1.41l.71.71-.71.71a.996.996 0 0 0 0 1.41m4.87 2.05c-.79.52-1.73.83-2.75.83a5.002 5.002 0 0 1-4.9-6H9c-3.87 0-7 3.13-7 7 0 3.53 2.61 6.43 6 6.92V20c0 1.24 1.41 1.94 2.4 1.2l4.27-3.2H15c3.87 0 7-3.13 7-7 0-.63-.09-1.25-.25-1.83"
          />
    </svg>
  );
});

IcEndChat.displayName = 'IcEndChat';
