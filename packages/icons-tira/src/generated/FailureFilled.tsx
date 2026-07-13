import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const FailureFilled = forwardRef<SVGSVGElement, IconComponentProps>(function FailureFilled(
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
      <path d="M13.7316 5C12.9618 3.66667 11.0373 3.66667 10.2675 5L3.33929 17C2.56949 18.3333 3.53174 20 5.07134 20H18.9277C20.4673 20 21.4296 18.3333 20.6598 17L13.7316 5Z" fill="currentColor"/>
      <path d="M14.9238 11.9242C15.1581 11.6898 15.1581 11.3099 14.9238 11.0756C14.6895 10.8413 14.3096 10.8413 14.0753 11.0756L11.9995 13.1514L9.92379 11.0757C9.68948 10.8414 9.30958 10.8414 9.07526 11.0757C8.84095 11.31 8.84095 11.6899 9.07526 11.9243L11.151 14L9.07528 16.0756C8.84096 16.3099 8.84096 16.6898 9.07528 16.9242C9.30959 17.1585 9.68949 17.1585 9.92381 16.9242L11.9995 14.8485L14.0753 16.9243C14.3096 17.1586 14.6895 17.1586 14.9238 16.9243C15.1581 16.6899 15.1581 16.31 14.9238 16.0757L12.848 14L14.9238 11.9242Z" fill="white"/>
    </svg>
  );
});

FailureFilled.displayName = 'FailureFilled';
