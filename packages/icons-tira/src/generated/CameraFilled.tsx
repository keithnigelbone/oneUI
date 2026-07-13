import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CameraFilled = forwardRef<SVGSVGElement, IconComponentProps>(function CameraFilled(
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
      <path d="M16 5.5C16 4.67157 15.3284 4 14.5 4H9.5C8.67157 4 8 4.67157 8 5.5C8 6.32843 7.32843 7 6.5 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7H17.5C16.6716 7 16 6.32843 16 5.5Z" fill="currentColor"/>
      <path d="M18 10C18 10.5523 17.5523 11 17 11C16.4477 11 16 10.5523 16 10C16 9.44772 16.4477 9 17 9C17.5523 9 18 9.44772 18 10Z" fill="white"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 17C13.933 17 15.5 15.433 15.5 13.5C15.5 11.567 13.933 10 12 10C10.067 10 8.5 11.567 8.5 13.5C8.5 15.433 10.067 17 12 17ZM12 15.8C13.2703 15.8 14.3 14.7703 14.3 13.5C14.3 12.2297 13.2703 11.2 12 11.2C10.7297 11.2 9.7 12.2297 9.7 13.5C9.7 14.7703 10.7297 15.8 12 15.8Z" fill="white"/>
    </svg>
  );
});

CameraFilled.displayName = 'CameraFilled';
