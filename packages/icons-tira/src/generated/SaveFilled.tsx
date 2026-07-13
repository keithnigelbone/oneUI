import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const SaveFilled = forwardRef<SVGSVGElement, IconComponentProps>(function SaveFilled(
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
      <path d="M11 5.5C11 4.67157 10.3284 4 9.5 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7H12.5C11.6716 7 11 6.32843 11 5.5Z" fill="currentColor"/>
      <path d="M8.57654 11.5748C8.81131 11.341 9.1912 11.3417 9.42507 11.5765L11.9901 14.1514L14.5765 11.5748C14.8113 11.341 15.1912 11.3417 15.4251 11.5764C15.6589 11.8112 15.6582 12.1911 15.4234 12.425L12.6954 15.1427C12.3041 15.5325 11.6709 15.5312 11.2811 15.14L8.57492 12.4234C8.34105 12.1886 8.34178 11.8087 8.57654 11.5748Z" fill="white"/>
    </svg>
  );
});

SaveFilled.displayName = 'SaveFilled';
