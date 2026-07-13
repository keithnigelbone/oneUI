import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CardFilled = forwardRef<SVGSVGElement, IconComponentProps>(function CardFilled(
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
      <path d="M4 4.5C2.89543 4.5 2 5.39543 2 6.5V17.5C2 18.6046 2.89543 19.5 4 19.5H20C21.1046 19.5 22 18.6046 22 17.5V6.5C22 5.39543 21.1046 4.5 20 4.5H4Z" fill="currentColor"/>
      <path d="M22 10.0999H2V8.8999H22V10.0999Z" fill="white"/>
      <path d="M4.39999 12.4999C4.39999 12.1685 4.66862 11.8999 4.99999 11.8999H13C13.3314 11.8999 13.6 12.1685 13.6 12.4999C13.6 12.8313 13.3314 13.0999 13 13.0999H4.99999C4.66862 13.0999 4.39999 12.8313 4.39999 12.4999Z" fill="white"/>
      <path d="M4.99999 14.8999C4.66862 14.8999 4.39999 15.1685 4.39999 15.4999C4.39999 15.8313 4.66862 16.0999 4.99999 16.0999H9.99999C10.3314 16.0999 10.6 15.8313 10.6 15.4999C10.6 15.1685 10.3314 14.8999 9.99999 14.8999H4.99999Z" fill="white"/>
    </svg>
  );
});

CardFilled.displayName = 'CardFilled';
