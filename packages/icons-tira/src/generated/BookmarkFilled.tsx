import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const BookmarkFilled = forwardRef<SVGSVGElement, IconComponentProps>(function BookmarkFilled(
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
      <path d="M9 4C6.79086 4 5 5.79086 5 8V18.072C5 18.8824 5.91353 19.3563 6.57602 18.8894L11.7146 15.2684C11.8519 15.1717 12.035 15.171 12.1729 15.2667L17.4302 18.9116C18.0934 19.3714 19 18.8968 19 18.0898V8C19 5.79086 17.2091 4 15 4H9Z" fill="currentColor"/>
    </svg>
  );
});

BookmarkFilled.displayName = 'BookmarkFilled';
