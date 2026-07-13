import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCallIncomingOutgoing = forwardRef<SVGSVGElement, IconComponentProps>(function IcCallIncomingOutgoing(
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
            d="M11 9a1 1 0 0 0 .71-.29L14 6.41V7a1 1 0 0 0 2 0V4a1 1 0 0 0-.08-.38 1 1 0 0 0-.54-.54A1 1 0 0 0 15 3h-3a1 1 0 0 0 0 2h.59l-2.3 2.29A1 1 0 0 0 11 9m10.71-.71a1 1 0 0 0-1.42 0L18 10.59V10a1 1 0 1 0-2 0v3c.002.13.029.26.08.38a1 1 0 0 0 .54.54c.12.051.25.078.38.08h3a1 1 0 0 0 0-2h-.59l2.3-2.29a1 1 0 0 0 0-1.42m-6.09 7.57a2 2 0 0 0-2.83 0l-.7.71a1 1 0 0 1-1.42 0l-4.24-4.24a1 1 0 0 1 0-1.42l.71-.7a2 2 0 0 0 0-2.83l-.71-.71a2 2 0 0 0-2.83 0l-1 1a2 2 0 0 0-.56 1.13c-.16 1.4-.04 4.74 3.68 8.48s7.08 3.84 8.49 3.72a2 2 0 0 0 1.13-.56l1-1a2 2 0 0 0 0-2.83z"
          />
    </svg>
  );
});

IcCallIncomingOutgoing.displayName = 'IcCallIncomingOutgoing';
