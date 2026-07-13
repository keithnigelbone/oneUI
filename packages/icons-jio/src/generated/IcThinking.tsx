import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcThinking = forwardRef<SVGSVGElement, IconComponentProps>(function IcThinking(
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
            d="M9 16.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0m.5 2.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m8-15a4 4 0 0 0-.48 0A5 5 0 0 0 8.4 5H8a4 4 0 0 0 0 8 4.2 4.2 0 0 0 1.33-.24 5 5 0 0 0 9.31.08A4.49 4.49 0 0 0 17.5 4"
          />
    </svg>
  );
});

IcThinking.displayName = 'IcThinking';
