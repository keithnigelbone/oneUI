import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcReturnOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcReturnOff(
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
      <path
            fill="currentColor"
            d="M21.71 2.29a.996.996 0 0 0-1.41 0l-18.01 18a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l2.15-2.15A8.96 8.96 0 0 0 12 21.99c4.96 0 9-4.04 9-9 0-2.38-.94-4.53-2.45-6.14l3.16-3.16a.996.996 0 0 0 0-1.41zM19 13c0 3.86-3.14 7-7 7-1.82 0-3.48-.71-4.72-1.86l9.86-9.86A6.95 6.95 0 0 1 19 13.01zM11.29 7.7c.15.15.34.22.53.26l1.14-1.14a1 1 0 0 0-.26-.53l-.27-.27c.4.02.78.09 1.15.18l1.6-1.6c-.88-.33-1.81-.54-2.79-.58l.31-.31a.996.996 0 1 0-1.41-1.41l-2 2a.996.996 0 0 0 0 1.41l2 2zM5.19 14.59c-.12-.51-.19-1.05-.19-1.6s-.45-1-1-1-1 .45-1 1c0 1.12.22 2.2.6 3.19l1.6-1.6z"
          />
    </svg>
  );
});

IcReturnOff.displayName = 'IcReturnOff';
