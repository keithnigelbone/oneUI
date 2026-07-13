import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ViewsFilled = forwardRef<SVGSVGElement, IconComponentProps>(function ViewsFilled(
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
      <path d="M15.8489 9.1687C17.3885 9.92473 19.0828 11.2074 20.5024 13.302C20.6883 13.5763 21.0614 13.6479 21.3357 13.462C21.61 13.2761 21.6816 12.903 21.4957 12.6287C18.3632 8.00682 13.944 6.93287 12.015 6.99758C6.69504 7.00259 3.45251 10.7966 2.48094 12.7139C2.33115 13.0095 2.44935 13.3705 2.74493 13.5203C3.04052 13.6701 3.40156 13.5519 3.55135 13.2563C4.14494 12.0849 5.74716 10.0742 8.27466 8.97356C7.78513 9.69381 7.49905 10.5635 7.49905 11.5C7.49905 13.9853 9.51377 16 11.9991 16C14.4843 16 16.4991 13.9853 16.4991 11.5C16.4991 10.6466 16.2615 9.84863 15.8489 9.1687Z" fill="currentColor"/>
    </svg>
  );
});

ViewsFilled.displayName = 'ViewsFilled';
