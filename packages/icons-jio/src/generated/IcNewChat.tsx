import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNewChat = forwardRef<SVGSVGElement, IconComponentProps>(function IcNewChat(
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
            d="M15 4H9a7 7 0 0 0-1 13.92V20a1.5 1.5 0 0 0 2.4 1.2l4.27-3.2H15a7 7 0 0 0 0-14m-1 8h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1V9a1 1 0 1 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcNewChat.displayName = 'IcNewChat';
