import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTutorial = forwardRef<SVGSVGElement, IconComponentProps>(function IcTutorial(
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
            d="M2.76 6.86c-.47.21-.76.68-.76 1.19v9.33c0 .63.67 1.03 1.22.73.97-.53 2.38-1.12 4.06-1.12 1.78 0 2.74.14 4.22 1.06V7.49C10.44 6.43 9.3 5.8 7.51 5.8c-2.03 0-3.78.63-4.75 1.06M21.24 6.86c-.98-.44-2.73-1.06-4.75-1.06-1.79 0-2.93.64-3.99 1.69v10.56c1.48-.92 2.44-1.06 4.22-1.06 1.68 0 3.09.6 4.06 1.12.55.3 1.22-.1 1.22-.73V8.05c0-.51-.29-.98-.76-1.19"
          />
    </svg>
  );
});

IcTutorial.displayName = 'IcTutorial';
