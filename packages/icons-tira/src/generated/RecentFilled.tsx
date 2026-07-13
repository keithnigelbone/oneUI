import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const RecentFilled = forwardRef<SVGSVGElement, IconComponentProps>(function RecentFilled(
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
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
      <path d="M12.0242 6.4751C12.3556 6.4751 12.6242 6.74373 12.6242 7.0751V11.7231L15.9709 15.0697C16.2052 15.304 16.2052 15.6839 15.9709 15.9183C15.7365 16.1526 15.3566 16.1526 15.1223 15.9183L11.6585 12.4544C11.5085 12.3044 11.4242 12.1009 11.4242 11.8887V7.0751C11.4242 6.74373 11.6928 6.4751 12.0242 6.4751Z" fill="white"/>
    </svg>
  );
});

RecentFilled.displayName = 'RecentFilled';
