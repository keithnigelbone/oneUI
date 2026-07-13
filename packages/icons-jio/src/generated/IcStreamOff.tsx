import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStreamOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcStreamOff(
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
            d="M4.65 15.11A7.9 7.9 0 0 1 4 12a8 8 0 0 1 3.56-6.61 1.001 1.001 0 1 0-1.12-1.66 9.89 9.89 0 0 0-3.29 12.88zM6 12a6.2 6.2 0 0 0 .21 1.55L8 11.73a4 4 0 0 1 1.6-2.91 1 1 0 1 0-1.2-1.6A5.93 5.93 0 0 0 6 12m13.71-6.3 1-1a1.004 1.004 0 1 0-1.42-1.42l-6.78 6.78A2 2 0 0 0 12 10a2 2 0 0 0-2 2q.003.26.07.51l-6.78 6.78a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l1-1c.24.2.48.38.74.56a1 1 0 0 0 .56.17.998.998 0 0 0 .973-1.191 1 1 0 0 0-.423-.64 5 5 0 0 1-.43-.33l1.42-1.42c.138.08.292.128.45.14a1 1 0 0 0 .8-.4 1 1 0 0 0 .08-1l1.61-1.6q.255.033.51 0a2 2 0 0 0 2-2 2 2 0 0 0-.07-.51L15.42 10a3.86 3.86 0 0 1 .58 2 3.93 3.93 0 0 1-1.6 3.18 1 1 0 0 0 1.2 1.6A5.93 5.93 0 0 0 18 12a5.86 5.86 0 0 0-1.12-3.46l1.41-1.41A7.85 7.85 0 0 1 20 12a8 8 0 0 1-3.56 6.61 1.001 1.001 0 1 0 1.12 1.66A10 10 0 0 0 22 12a9.85 9.85 0 0 0-2.29-6.3"
          />
    </svg>
  );
});

IcStreamOff.displayName = 'IcStreamOff';
