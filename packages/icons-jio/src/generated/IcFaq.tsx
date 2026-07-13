import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFaq = forwardRef<SVGSVGElement, IconComponentProps>(function IcFaq(
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
            d="M12.5 2a9.49 9.49 0 0 0-8.59 13.54l-.56 3.39a1.49 1.49 0 0 0 1.72 1.72l3.39-.56A9.5 9.5 0 1 0 12.5 2m0 15.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m1.77-5.36c-.66.42-.77.54-.77.86a1 1 0 1 1-2 0 2.93 2.93 0 0 1 1.69-2.55c.65-.41.81-.56.81-.95a1.5 1.5 0 1 0-3 0 1 1 0 1 1-2 0 3.5 3.5 0 1 1 7 0 3 3 0 0 1-1.73 2.64"
          />
    </svg>
  );
});

IcFaq.displayName = 'IcFaq';
