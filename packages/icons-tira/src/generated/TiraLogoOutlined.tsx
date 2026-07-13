import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const TiraLogoOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function TiraLogoOutlined(
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
      <path d="M6 16.2796V2H7.96505V7.13195H16.4993V8.92225H7.96505V16.2832C7.96505 18.9223 9.43081 20.1847 11.6883 20.1847C13.9173 20.1847 15.4116 18.9544 15.4116 16.2832V15.9622H17.316V16.2832C17.316 20.0956 15.03 22 11.6847 22C8.31812 21.9964 6 20.092 6 16.2796Z" fill="currentColor"/>
    </svg>
  );
});

TiraLogoOutlined.displayName = 'TiraLogoOutlined';
