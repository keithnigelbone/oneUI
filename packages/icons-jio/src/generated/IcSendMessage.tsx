import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSendMessage = forwardRef<SVGSVGElement, IconComponentProps>(function IcSendMessage(
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
                d='M19.79 10.16l-14-6A2 2 0 005 4a2 2 0 00-1.965 2.398 2 2 0 00.355.792L6.76 12l-3.35 4.79a2 2 0 002.38 3.05l14-6a2 2 0 000-3.68z'
                fill='currentColor'
              />
    </svg>
  );
});

IcSendMessage.displayName = 'IcSendMessage';
