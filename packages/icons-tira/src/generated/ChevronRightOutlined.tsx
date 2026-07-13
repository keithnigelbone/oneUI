import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ChevronRightOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function ChevronRightOutlined(
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
      <path d="M7.57613 4.42424C7.34181 4.18992 7.34181 3.80992 7.57613 3.57561C7.81045 3.34139 8.19048 3.34133 8.42476 3.57561L16.1416 11.2934C16.532 11.6839 16.532 12.317 16.1416 12.7074L8.42476 20.4242C8.19044 20.6586 7.81044 20.6586 7.57613 20.4242C7.34181 20.1899 7.34181 19.8099 7.57613 19.5756L15.1523 12.0004L7.57613 4.42424Z" fill="currentColor"/>
    </svg>
  );
});

ChevronRightOutlined.displayName = 'ChevronRightOutlined';
