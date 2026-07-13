import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ChevronDownOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function ChevronDownOutlined(
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
      <path d="M19.5761 7.57576C19.8104 7.34145 20.1904 7.34145 20.4248 7.57576C20.659 7.81008 20.659 8.19011 20.4248 8.42439L12.707 16.1412C12.3165 16.5316 11.6834 16.5317 11.2929 16.1412L3.57613 8.42439C3.34181 8.19008 3.34181 7.81007 3.57613 7.57576C3.81044 7.34145 4.19044 7.34145 4.42476 7.57576L12 15.1519L19.5761 7.57576Z" fill="currentColor"/>
    </svg>
  );
});

ChevronDownOutlined.displayName = 'ChevronDownOutlined';
