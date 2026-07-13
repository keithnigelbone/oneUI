import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCallSound = forwardRef<SVGSVGElement, IconComponentProps>(function IcCallSound(
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
            d="M18.16 14.32a2 2 0 0 0-2.82 0l-.71.71a1 1 0 0 1-1.42 0L9 10.79a1 1 0 0 1 0-1.42l.71-.71a2 2 0 0 0 0-2.82L9 5.13a2 2 0 0 0-2.83 0l-1 1a1.9 1.9 0 0 0-.57 1.13c-.18 1.4-.08 4.74 3.67 8.47s7.07 3.85 8.48 3.68a1.9 1.9 0 0 0 1.13-.57l1-1a2 2 0 0 0 0-2.83zm-4.49-5.21a2 2 0 0 1 1.22 1.22 1 1 0 0 0 .94.67q.17-.002.33-.06a1 1 0 0 0 .61-1.27 3.94 3.94 0 0 0-2.44-2.44 1 1 0 0 0-.66 1.88m.5-5a1.014 1.014 0 1 0-.33 2 5 5 0 0 1 4.09 4.1 1 1 0 0 0 1 .83h.16a1 1 0 0 0 .82-1.16 7 7 0 0 0-5.74-5.78z"
          />
    </svg>
  );
});

IcCallSound.displayName = 'IcCallSound';
