import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CursorFilled = forwardRef<SVGSVGElement, IconComponentProps>(function CursorFilled(
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
      <path d="M6.58821 4.8976C6.54264 4.31379 7.19133 3.93543 7.67705 4.26248L21.0243 13.2496C21.5837 13.6262 21.3393 14.4984 20.6656 14.5295L13.8464 14.8443L16.7608 19.8921C16.9265 20.1791 16.8282 20.546 16.5412 20.7117C16.2542 20.8774 15.8873 20.7791 15.7216 20.4921L12.7696 15.3791L9.12571 21.186C8.76716 21.7574 7.88739 21.541 7.8349 20.8684L6.58821 4.8976Z" fill="currentColor"/>
    </svg>
  );
});

CursorFilled.displayName = 'CursorFilled';
