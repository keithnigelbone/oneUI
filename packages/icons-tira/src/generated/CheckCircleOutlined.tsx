import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CheckCircleOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function CheckCircleOutlined(
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
      <path d="M16.9243 9.42442C17.1586 9.19012 17.1586 8.81022 16.9243 8.5759C16.69 8.34157 16.3101 8.34156 16.0758 8.57587L10.3937 14.2576L7.92428 11.7883C7.68996 11.554 7.31006 11.554 7.07575 11.7883C6.84144 12.0226 6.84145 12.4025 7.07577 12.6368L9.68659 15.2476C10.0771 15.6381 10.7102 15.6381 11.1008 15.2476L16.9243 9.42442Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM19.8 12C19.8 16.3078 16.3078 19.8 12 19.8C7.69218 19.8 4.2 16.3078 4.2 12C4.2 7.69218 7.69218 4.2 12 4.2C16.3078 4.2 19.8 7.69218 19.8 12Z" fill="currentColor"/>
    </svg>
  );
});

CheckCircleOutlined.displayName = 'CheckCircleOutlined';
