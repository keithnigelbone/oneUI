import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDirectionTurnRight = forwardRef<SVGSVGElement, IconComponentProps>(function IcDirectionTurnRight(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m4.71 8.71-2 2a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l.3-.29H11a1.88 1.88 0 0 0-2 2v2a1 1 0 1 1-2 0v-2a3.89 3.89 0 0 1 4-4h2.59l-.3-.29a1.004 1.004 0 1 1 1.42-1.42l2 2a1 1 0 0 1 0 1.42"
          />
    </svg>
  );
});

IcDirectionTurnRight.displayName = 'IcDirectionTurnRight';
