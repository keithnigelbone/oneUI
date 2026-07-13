import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMobileNumberPortability = forwardRef<SVGSVGElement, IconComponentProps>(function IcMobileNumberPortability(
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
            d="M19 4h-4c-.94 0-1.84.45-2.4 1.2l-2 2.67c-.39.52-.6 1.15-.6 1.8V18c0 1.65 1.35 3 3 3h6c1.65 0 3-1.35 3-3V7c0-1.65-1.35-3-3-3m-7 7h2v3h-2zm4 8h-3c-.55 0-1-.45-1-1v-2h4zm4-1c0 .55-.45 1-1 1h-1v-3h2zm0-4h-4v-3h4zM8 9.19c0-.06.01-.12.02-.19H8c-.94 0-1.84.45-2.4 1.2l-2 2.67c-.39.52-.6 1.15-.6 1.8V18c0 1.65 1.35 3 3 3h3.03C8.4 20.16 8 19.13 8 18zM9.71 4.3l-2-2A.996.996 0 1 0 6.3 3.71l.29.29H3c-.55 0-1 .45-1 1s.45 1 1 1h3.59l-.29.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l2-2a.996.996 0 0 0 0-1.41z"
          />
    </svg>
  );
});

IcMobileNumberPortability.displayName = 'IcMobileNumberPortability';
