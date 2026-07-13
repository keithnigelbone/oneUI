import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAutoMode = forwardRef<SVGSVGElement, IconComponentProps>(function IcAutoMode(
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
            d="M7.71 11.29a1 1 0 0 0-1.42 0l-.22.22a6 6 0 0 1 10.22-3.75 1.004 1.004 0 1 0 1.42-1.42 8 8 0 0 0-13.64 5.31l-.36-.36a1.004 1.004 0 1 0-1.42 1.42l2 2a1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42m14 0-2-2a1 1 0 0 0-1.42 0l-2 2a1.003 1.003 0 1 0 1.42 1.42l.27-.27A6 6 0 0 1 12 18a5.93 5.93 0 0 1-4.24-1.76 1.004 1.004 0 1 0-1.42 1.42A8 8 0 0 0 20 12.39l.31.32a1 1 0 0 0 1.42 0 1 1 0 0 0-.02-1.42M11.53 9.82l-1.5 4a.52.52 0 0 0 .29.65.51.51 0 0 0 .65-.29l.25-.68h1.56l.25.68a.51.51 0 0 0 .47.32h.18a.51.51 0 0 0 .29-.65l-1.5-4a.52.52 0 0 0-.94-.03m.07 2.68.4-1.08.4 1.08z"
          />
    </svg>
  );
});

IcAutoMode.displayName = 'IcAutoMode';
