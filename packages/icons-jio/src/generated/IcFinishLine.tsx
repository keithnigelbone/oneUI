import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFinishLine = forwardRef<SVGSVGElement, IconComponentProps>(function IcFinishLine(
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
            d="M5 2a1 1 0 0 0-1 1v19h2V3a1 1 0 0 0-1-1m14.37 1.07c-2.75-1.1-5-.58-7.11-.07A14.6 14.6 0 0 1 8 3.56v12h.45a18.3 18.3 0 0 0 4.27-.56c2-.48 3.75-.89 5.91 0a1 1 0 0 0 1.27-.49A1 1 0 0 0 20 14V4a1 1 0 0 0-.63-.93"
          />
    </svg>
  );
});

IcFinishLine.displayName = 'IcFinishLine';
