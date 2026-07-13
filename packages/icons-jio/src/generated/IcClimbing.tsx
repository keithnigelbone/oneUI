import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcClimbing = forwardRef<SVGSVGElement, IconComponentProps>(function IcClimbing(
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
            d="M13.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m4.5 5h-2a1 1 0 0 1-.8-.4l-2.4-3.2a1 1 0 0 0-1-.38 1 1 0 0 0-.78.69L8.25 16a2.8 2.8 0 0 1-.48.94L5.2 20.4a1 1 0 0 0 1.6 1.2l2.57-3.43a4.9 4.9 0 0 0 .79-1.56l.74-2.47 1.51 1a2 2 0 0 1 .85 1.28L14 20.2a1 1 0 0 0 1 .8h.2a1 1 0 0 0 .8-1.2l-.78-3.8a3.93 3.93 0 0 0-1.7-2.54l-2-1.31h-.05l.89-3 1.24 1.65A3 3 0 0 0 16 12h2a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcClimbing.displayName = 'IcClimbing';
