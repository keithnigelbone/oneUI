import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcConversation = forwardRef<SVGSVGElement, IconComponentProps>(function IcConversation(
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
            d="M11 14c-.26 0-.51-.1-.71-.29a.996.996 0 0 1 0-1.41l8-8.01A.996.996 0 1 1 19.7 5.7l-7.99 8.01c-.2.2-.45.29-.71.29"
          />
          <path
            fill="currentColor"
            d="M18 20H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h6c.55 0 1 .45 1 1s-.45 1-1 1H6v12h12v-6c0-.55.45-1 1-1s1 .45 1 1v6c0 1.1-.9 2-2 2"
          />
    </svg>
  );
});

IcConversation.displayName = 'IcConversation';
