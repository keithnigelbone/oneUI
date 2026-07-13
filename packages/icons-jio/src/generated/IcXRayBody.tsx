import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcXRayBody = forwardRef<SVGSVGElement, IconComponentProps>(function IcXRayBody(
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
            d="M17 2H7C5.34 2 4 3.34 4 5v14c0 1.66 1.34 3 3 3v-2.17c0-.8.31-1.55.88-2.12L9.59 16H9c-.55 0-1-.45-1-1s.45-1 1-1h2v-2H7c-.55 0-1-.45-1-1s.45-1 1-1h4V8H9c-.55 0-1-.45-1-1s.45-1 1-1h2V5c0-.55.45-1 1-1s1 .45 1 1v1h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2h4c.55 0 1 .45 1 1s-.45 1-1 1h-4v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-.59l1.71 1.71c.57.57.88 1.32.88 2.12V22c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3m-5 14.41-2.71 2.71a1 1 0 0 0-.29.71V22h6v-2.17c0-.26-.11-.52-.29-.71z"
          />
    </svg>
  );
});

IcXRayBody.displayName = 'IcXRayBody';
