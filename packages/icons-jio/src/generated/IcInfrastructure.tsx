import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcInfrastructure = forwardRef<SVGSVGElement, IconComponentProps>(function IcInfrastructure(
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
            d="M20 13a1 1 0 1 0 0-2h-2.78v-.1l1.9-3.9A2 2 0 1 0 19 3a2 2 0 0 0-1.72 1h-3.56a2 2 0 0 0-3.44 0H6.72A2 2 0 0 0 5 3a2 2 0 1 0-.12 4l2 3.91v.1H4a1 1 0 0 0 0 2h2.78v.1L4.88 17A2 2 0 1 0 5 21a2 2 0 0 0 1.72-1h3.56a2 2 0 0 0 3.44 0h3.56A2 2 0 0 0 19 21a2.001 2.001 0 0 0 .12-4l-1.95-3.9V13zm-8-5.76 1.83 3.66s0 .07-.05.1h-3.56s0-.07-.05-.1zM6.67 6.1V6h3.56s0 .07.05.1L8.5 9.76zM10.28 18H6.72v-.1l1.78-3.66 1.83 3.66s-.03.1-.05.1M12 16.76l-1.83-3.66s0-.07.05-.1h3.56s0 .07.05.1zm5.33 1.14v.1h-3.61s0-.07-.05-.1l1.83-3.66zM15.5 9.76 13.67 6.1s0-.07.05-.1h3.56v.1z"
          />
    </svg>
  );
});

IcInfrastructure.displayName = 'IcInfrastructure';
