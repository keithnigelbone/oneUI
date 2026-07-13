import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ArrowRightOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function ArrowRightOutlined(
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
      <path d="M13.9404 5.56338C14.1513 5.36488 14.4682 5.34851 14.6963 5.50869L14.7881 5.58877L20.1777 11.3144L20.2412 11.3896C20.5383 11.7742 20.5174 12.3245 20.1777 12.6855L14.7881 18.411C14.5609 18.6521 14.1816 18.6634 13.9404 18.4364C13.6996 18.2093 13.6882 17.8299 13.915 17.5888L18.6104 12.5995H3.99902L3.87793 12.5878C3.6046 12.5318 3.39844 12.2898 3.39844 11.9999C3.39849 11.71 3.60461 11.468 3.87793 11.412L3.99902 11.4003H18.6104L13.915 6.41104L13.8408 6.31436C13.6946 6.07708 13.7297 5.762 13.9404 5.56338Z" fill="currentColor"/>
    </svg>
  );
});

ArrowRightOutlined.displayName = 'ArrowRightOutlined';
