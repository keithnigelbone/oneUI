import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const WarningOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function WarningOutlined(
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
      <path d="M12.0664 9.0155C12.3978 9.0155 12.6664 9.28413 12.6664 9.6155V14.6155C12.6664 14.9469 12.3978 15.2155 12.0664 15.2155C11.7351 15.2155 11.4664 14.9469 11.4664 14.6155V9.6155C11.4664 9.28413 11.7351 9.0155 12.0664 9.0155Z" fill="currentColor"/>
      <path d="M12.0663 16.8155C12.3977 16.8155 12.6663 16.5469 12.6663 16.2155C12.6663 15.8841 12.3977 15.6155 12.0663 15.6155C11.735 15.6155 11.4663 15.8841 11.4663 16.2155C11.4663 16.5469 11.735 16.8155 12.0663 16.8155Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M13.7316 5C12.9618 3.66667 11.0373 3.66667 10.2675 5L3.33929 17C2.56949 18.3333 3.53174 20 5.07134 20H18.9277C20.4673 20 21.4296 18.3333 20.6598 17L13.7316 5ZM19.6206 17.6L12.6924 5.6C12.3844 5.06667 11.6146 5.06667 11.3067 5.6L4.37852 17.6C4.0706 18.1333 4.4555 18.8 5.07134 18.8H18.9277C19.5436 18.8 19.9285 18.1333 19.6206 17.6Z" fill="currentColor"/>
    </svg>
  );
});

WarningOutlined.displayName = 'WarningOutlined';
