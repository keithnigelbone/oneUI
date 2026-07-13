import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const FailureOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function FailureOutlined(
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
      <path d="M14.9238 11.0758C15.1581 11.3101 15.1581 11.69 14.9238 11.9243L12.8481 14L14.9238 16.0757C15.1581 16.3101 15.1581 16.6899 14.9238 16.9243C14.6895 17.1586 14.3096 17.1586 14.0753 16.9243L11.9995 14.8485L9.92381 16.9243C9.68949 17.1586 9.30959 17.1586 9.07528 16.9243C8.84096 16.69 8.84096 16.3101 9.07528 16.0758L11.151 14L9.07526 11.9243C8.84095 11.6899 8.84095 11.3101 9.07526 11.0757C9.30958 10.8414 9.68948 10.8414 9.92379 11.0757L11.9995 13.1515L14.0753 11.0758C14.3096 10.8414 14.6895 10.8414 14.9238 11.0758Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M13.7316 5C12.9618 3.66667 11.0373 3.66667 10.2675 5L3.33929 17C2.56949 18.3333 3.53174 20 5.07134 20H18.9277C20.4673 20 21.4296 18.3333 20.6598 17L13.7316 5ZM19.6206 17.6L12.6924 5.6C12.3844 5.06667 11.6146 5.06667 11.3067 5.6L4.37852 17.6C4.0706 18.1333 4.4555 18.8 5.07134 18.8H18.9277C19.5436 18.8 19.9285 18.1333 19.6206 17.6Z" fill="currentColor"/>
    </svg>
  );
});

FailureOutlined.displayName = 'FailureOutlined';
