import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHorzontalSwing = forwardRef<SVGSVGElement, IconComponentProps>(function IcHorzontalSwing(
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
            d="M12 10a6 6 0 0 0 6-6 1 1 0 0 0-1-1H7a1 1 0 0 0-1 1 6 6 0 0 0 6 6m-3.29 2.29a1 1 0 0 0-1.42 0L5 14.59V14a1 1 0 1 0-2 0v3a1 1 0 0 0 1 1h3a1 1 0 0 0 0-2h-.59l2.3-2.29a1 1 0 0 0 0-1.42M20 13a1 1 0 0 0-1 1v.59l-2.29-2.3a1.004 1.004 0 1 0-1.42 1.42l2.3 2.29H17a1 1 0 0 0 0 2h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1m-6.71 4.29-.29.3V13a1 1 0 0 0-2 0v4.59l-.29-.3a1.004 1.004 0 0 0-1.42 1.42l2 2a1 1 0 0 0 1.42 0l2-2a1.004 1.004 0 1 0-1.42-1.42"
          />
    </svg>
  );
});

IcHorzontalSwing.displayName = 'IcHorzontalSwing';
