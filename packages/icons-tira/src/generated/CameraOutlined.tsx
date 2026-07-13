import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CameraOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function CameraOutlined(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M12 17C13.933 17 15.5 15.433 15.5 13.5C15.5 11.567 13.933 10 12 10C10.067 10 8.5 11.567 8.5 13.5C8.5 15.433 10.067 17 12 17ZM12 15.8C13.2703 15.8 14.3 14.7703 14.3 13.5C14.3 12.2297 13.2703 11.2 12 11.2C10.7297 11.2 9.7 12.2297 9.7 13.5C9.7 14.7703 10.7297 15.8 12 15.8Z" fill="currentColor"/>
      <path d="M17 11C17.5523 11 18 10.5523 18 10C18 9.44772 17.5523 9 17 9C16.4477 9 16 9.44772 16 10C16 10.5523 16.4477 11 17 11Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M14.5 4C15.3284 4 16 4.67157 16 5.5C16 6.32843 16.6716 7 17.5 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9C3 7.89543 3.89543 7 5 7H6.5C7.32843 7 8 6.32843 8 5.5C8 4.67157 8.67157 4 9.5 4H14.5ZM14.8 5.5C14.8 5.33431 14.6657 5.2 14.5 5.2H9.5C9.33431 5.2 9.2 5.33431 9.2 5.5C9.2 6.99117 7.99117 8.2 6.5 8.2H5C4.55817 8.2 4.2 8.55817 4.2 9V18C4.2 18.4418 4.55817 18.8 5 18.8H19C19.4418 18.8 19.8 18.4418 19.8 18V9C19.8 8.55817 19.4418 8.2 19 8.2H17.5C16.0088 8.2 14.8 6.99117 14.8 5.5Z" fill="currentColor"/>
    </svg>
  );
});

CameraOutlined.displayName = 'CameraOutlined';
