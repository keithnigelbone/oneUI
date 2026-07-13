import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcColdIcy = forwardRef<SVGSVGElement, IconComponentProps>(function IcColdIcy(
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
            d="M12 5.5a2.5 2.5 0 0 0-5 0v8.39c-.94.75-1.5 1.9-1.5 3.11 0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.21-.56-2.35-1.5-3.11zM7.5 17c0-.71.38-1.35 1-1.72l.5-.29V5.5c0-.28.22-.5.5-.5s.5.22.5.5v9.49l.5.29c.63.37 1 1.01 1 1.72zM20 9h-1.09l.79-.79a.996.996 0 1 0-1.41-1.41l-2.21 2.21h-1.09V7.92l2.21-2.21a.996.996 0 1 0-1.41-1.41l-.79.79V4c0-.55-.45-1-1-1s-1 .45-1 1v8.5c0 .13.03.26.08.38s.12.23.22.33l2.5 2.5c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-2.21-2.21V11h1.09l2.21 2.21c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-.79-.79h1.09c.55 0 1-.45 1-1s-.45-1-1-1z"
          />
    </svg>
  );
});

IcColdIcy.displayName = 'IcColdIcy';
