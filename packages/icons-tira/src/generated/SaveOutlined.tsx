import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const SaveOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function SaveOutlined(
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
      <path d="M9.42508 11.5765C9.19121 11.3418 8.81131 11.3411 8.57655 11.5749C8.34179 11.8088 8.34106 12.1887 8.57492 12.4235L11.2811 15.1401C11.6709 15.5313 12.3041 15.5325 12.6954 15.1428L15.4235 12.4251C15.6582 12.1912 15.6589 11.8113 15.4251 11.5765C15.1912 11.3418 14.8113 11.3411 14.5765 11.5749L11.9902 14.1515L9.42508 11.5765Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M11 5.5C11 4.67157 10.3284 4 9.5 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7H12.5C11.6716 7 11 6.32843 11 5.5ZM5 5.2H9.5C9.66569 5.2 9.8 5.33431 9.8 5.5C9.8 6.99117 11.0088 8.2 12.5 8.2H19C19.4418 8.2 19.8 8.55817 19.8 9V18C19.8 18.4418 19.4418 18.8 19 18.8H5C4.55817 18.8 4.2 18.4418 4.2 18V6C4.2 5.55817 4.55817 5.2 5 5.2Z" fill="currentColor"/>
    </svg>
  );
});

SaveOutlined.displayName = 'SaveOutlined';
