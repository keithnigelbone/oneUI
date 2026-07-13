import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ChevronUpOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function ChevronUpOutlined(
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
      <path d="M4.42387 16.4242C4.18956 16.6586 3.80956 16.6586 3.57524 16.4242C3.34102 16.1899 3.34096 15.8099 3.57524 15.5756L11.293 7.85881C11.6835 7.46841 12.3166 7.46833 12.7071 7.85881L20.4239 15.5756C20.6582 15.8099 20.6582 16.1899 20.4239 16.4242C20.1896 16.6586 19.8096 16.6586 19.5752 16.4242L12 8.84807L4.42387 16.4242Z" fill="currentColor"/>
    </svg>
  );
});

ChevronUpOutlined.displayName = 'ChevronUpOutlined';
