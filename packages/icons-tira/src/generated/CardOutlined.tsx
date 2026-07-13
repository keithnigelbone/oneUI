import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CardOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function CardOutlined(
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
      <path d="M4.39999 12.5C4.39999 12.1687 4.66862 11.9 4.99999 11.9H13C13.3314 11.9 13.6 12.1687 13.6 12.5C13.6 12.8314 13.3314 13.1 13 13.1H4.99999C4.66862 13.1 4.39999 12.8314 4.39999 12.5Z" fill="currentColor"/>
      <path d="M4.99999 14.9C4.66862 14.9 4.39999 15.1687 4.39999 15.5C4.39999 15.8314 4.66862 16.1 4.99999 16.1H9.99999C10.3314 16.1 10.6 15.8314 10.6 15.5C10.6 15.1687 10.3314 14.9 9.99999 14.9H4.99999Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M2 6.5C2 5.39543 2.89543 4.5 4 4.5H20C21.1046 4.5 22 5.39543 22 6.5V17.5C22 18.6046 21.1046 19.5 20 19.5H4C2.89543 19.5 2 18.6046 2 17.5V6.5ZM4 5.7H20C20.4418 5.7 20.8 6.05817 20.8 6.5V8.90002H3.2V6.5C3.2 6.05817 3.55817 5.7 4 5.7ZM20.8 10.1V17.5C20.8 17.9418 20.4418 18.3 20 18.3H4C3.55817 18.3 3.2 17.9418 3.2 17.5V10.1H20.8Z" fill="currentColor"/>
    </svg>
  );
});

CardOutlined.displayName = 'CardOutlined';
