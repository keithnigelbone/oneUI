import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWrestling = forwardRef<SVGSVGElement, IconComponentProps>(function IcWrestling(
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
            d="M3.5 10a1.5 1.5 0 0 0 1.39-.93c.121-.27.16-.569.11-.86A1.49 1.49 0 0 0 3.79 7a1.5 1.5 0 0 0-.86.08 1.55 1.55 0 0 0-.68.56A1.5 1.5 0 0 0 3.5 10m12.31 0 4.81 1.93q.184.066.38.07a1 1 0 0 0 .64-.23 1 1 0 0 0 .36-.57 1 1 0 0 0-.1-.67 1 1 0 0 0-.51-.45l-5-2A1 1 0 0 0 16 8h-1.76l1.92-1 4.67 1a.86.86 0 0 0 .39 0 1 1 0 0 0 .63-.45 1 1 0 0 0 .15-.38 1 1 0 0 0 0-.39.9.9 0 0 0-.16-.36 1.06 1.06 0 0 0-.69-.42l-5-1a1 1 0 0 0-.61.1L11.71 7l.5 3zM6.5 14a1.5 1.5 0 0 0-1.47 1.79A1.49 1.49 0 0 0 6.21 17c.288.059.587.031.86-.08a1.55 1.55 0 0 0 .68-.56A1.5 1.5 0 0 0 6.5 14m-.39-4.16-2.54 1.28a.94.94 0 0 0-.5.57l-1 3a1.1 1.1 0 0 0-.07.41 1 1 0 0 0 .34.71q.16.135.36.2.15.02.3-.01a1 1 0 0 0 1-.68l.86-2.6 1.62-.81zm13.77 5.71a.94.94 0 0 0-.52-.48l-5-2a.9.9 0 0 0-.61 0l-2.94.74-.81-5a1 1 0 0 0-.14-.37 1.1 1.1 0 0 0-.27-.29A1 1 0 0 0 9.24 8a1 1 0 0 0-.39 0 1 1 0 0 0-.37.14 1.1 1.1 0 0 0-.29.27 1 1 0 0 0-.19.36 1.1 1.1 0 0 0 0 .4l1 6a1 1 0 0 0 .44.68.84.84 0 0 0 .38.15 1 1 0 0 0 .41 0l3.21-.81L14.88 18l-.77 1.55a1 1 0 0 0 .132 1.1 1 1 0 0 0 .308.24c.14.071.293.11.45.11a1 1 0 0 0 .52-.15 1 1 0 0 0 .37-.4l1-2A1 1 0 0 0 17 18a1 1 0 0 0-.1-.45l-.82-1.64 2.2.88 1.83 3.66a1 1 0 0 0 .37.4.93.93 0 0 0 .52.15 1 1 0 0 0 .94-.69 1 1 0 0 0-.05-.76z"
          />
    </svg>
  );
});

IcWrestling.displayName = 'IcWrestling';
