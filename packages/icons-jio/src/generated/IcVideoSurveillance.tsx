import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVideoSurveillance = forwardRef<SVGSVGElement, IconComponentProps>(function IcVideoSurveillance(
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
            d="M18.13 8.05 8.42 3.3a3 3 0 0 0-3.95 1.34L2.3 9a2.93 2.93 0 0 0 1.35 4l4.22 2-1.49 3H3a1 1 0 0 0 0 2h4a1 1 0 0 0 .89-.55l1.78-3.55 3.68 1.8a3 3 0 0 0 4-1.34L19.47 12a2.93 2.93 0 0 0-1.34-3.95m3.32 4.35a1 1 0 0 0-1.32.45l-1.73 3.51a1 1 0 0 0 .45 1.3 1 1 0 0 0 1.31-.44l1.74-3.51a1 1 0 0 0-.45-1.31"
          />
    </svg>
  );
});

IcVideoSurveillance.displayName = 'IcVideoSurveillance';
