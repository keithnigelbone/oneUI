import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcThinkingBrain = forwardRef<SVGSVGElement, IconComponentProps>(function IcThinkingBrain(
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
            d="m20.89 13.54-2-3.86A8 8 0 1 0 7 17.92V20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1h1a3 3 0 0 0 3-3v-1h1a1 1 0 0 0 .89-1.46m-6.32-4.46-7.06 4.09a1.12 1.12 0 0 1-1.63-.65 5.14 5.14 0 0 1 0-2.83 5.43 5.43 0 0 1 4.58-3.87 5.28 5.28 0 0 1 4.32 1.52 1.1 1.1 0 0 1-.21 1.74"
          />
    </svg>
  );
});

IcThinkingBrain.displayName = 'IcThinkingBrain';
