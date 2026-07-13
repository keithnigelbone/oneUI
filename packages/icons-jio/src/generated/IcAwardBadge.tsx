import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAwardBadge = forwardRef<SVGSVGElement, IconComponentProps>(function IcAwardBadge(
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
            d="m19.77 9.36-.82-1 .32-1.24A1 1 0 0 0 18.71 6l-1.13-.51-.23-1.25a1 1 0 0 0-1-.82h-1.23l-.73-1a1 1 0 0 0-1.29-.3l-1.1.59-1.08-.59a1 1 0 0 0-1.29.3l-.73 1H7.67a1 1 0 0 0-1 .82l-.25 1.22L5.29 6a1 1 0 0 0-.56 1.17l.32 1.24-.82 1a1 1 0 0 0 0 1.28l.82 1-.32 1.24A1 1 0 0 0 5.29 14l1.13.51.23 1.25a1 1 0 0 0 .82.8L7 19.72a2 2 0 0 0 3.09 1.94L12 20.4l1.89 1.26A2 2 0 0 0 15 22a2.002 2.002 0 0 0 1.98-2.31l-.45-3.13a1 1 0 0 0 .82-.8l.23-1.25 1.13-.51a1 1 0 0 0 .56-1.17L19 11.62l.82-1a1 1 0 0 0-.05-1.26m-2.69 1.37a1 1 0 0 0-.2.89l.24.93-.84.37a1 1 0 0 0-.57.74l-.17.92h-.9a1 1 0 0 0-.85.41l-.53.74-.78-.42a1 1 0 0 0-1 0l-.78.42-.49-.73a.91.91 0 0 0-.85-.41h-.9l-.17-.92a1 1 0 0 0-.57-.74l-.84-.37.24-.93a1 1 0 0 0-.2-.89L6.31 10l.61-.73a1 1 0 0 0 .2-.89l-.24-.93.84-.37a1 1 0 0 0 .57-.74l.17-.92h.9a.94.94 0 0 0 .85-.42l.53-.74.78.42a1 1 0 0 0 1 0l.78-.42.53.74a1 1 0 0 0 .85.41h.9l.17.92a1 1 0 0 0 .57.74l.84.37-.24.93a1 1 0 0 0 .2.89l.61.73zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6"
          />
    </svg>
  );
});

IcAwardBadge.displayName = 'IcAwardBadge';
