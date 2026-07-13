import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const BookmarkOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function BookmarkOutlined(
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
      <path d="M15 4C17.2091 4 19 5.79086 19 8V18.0898C19 18.8966 18.0938 19.3713 17.4307 18.9121L12.1729 15.2666C12.0349 15.171 11.8521 15.1719 11.7148 15.2686L6.57617 18.8896C5.91376 19.3564 5.0002 18.8825 5 18.0723V8C5 5.79086 6.79086 4 9 4H15ZM9 5.2002C7.4536 5.2002 6.2002 6.4536 6.2002 8V17.6865L11.0234 14.2871C11.5724 13.9004 12.3046 13.8978 12.8564 14.2803L17.7998 17.708V8C17.7998 6.4536 16.5464 5.2002 15 5.2002H9Z" fill="currentColor"/>
    </svg>
  );
});

BookmarkOutlined.displayName = 'BookmarkOutlined';
