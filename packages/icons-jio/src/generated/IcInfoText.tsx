import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcInfoText = forwardRef<SVGSVGElement, IconComponentProps>(function IcInfoText(
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
            d="M17 19h-4V9c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h4v9H7c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1M12 6c.83 0 1.5-.67 1.5-1.5S12.83 3 12 3s-1.5.67-1.5 1.5S11.17 6 12 6"
          />
    </svg>
  );
});

IcInfoText.displayName = 'IcInfoText';
