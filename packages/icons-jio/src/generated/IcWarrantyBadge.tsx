import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWarrantyBadge = forwardRef<SVGSVGElement, IconComponentProps>(function IcWarrantyBadge(
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
            d="M18.91 6.03a7.9 7.9 0 0 0-2.8-2.889 7.96 7.96 0 0 0-3.858-1.138 7.8 7.8 0 0 0-3.918.91 8 8 0 0 0-2.968 2.711 7.9 7.9 0 0 0-1.257 3.83 7.913 7.913 0 0 0 3.423 6.995l-.465 3.095c-.05.376 0 .762.169 1.108.158.347.415.633.742.841.326.198.702.307 1.078.307.386 0 .752-.119 1.068-.336l1.89-1.247 1.87 1.247a1.97 1.97 0 0 0 2.157.03c.326-.209.583-.505.742-.852.158-.356.217-.741.158-1.127l-.445-3.097a7.8 7.8 0 0 0 2.513-2.82 8 8 0 0 0 .92-3.67 7.87 7.87 0 0 0-1.02-3.888zm-2.701 8.093a5.92 5.92 0 0 1-4.195 1.741 5.9 5.9 0 0 1-3.294-1 5.9 5.9 0 0 1-2.187-2.66 6 6 0 0 1-.336-3.434 5.93 5.93 0 0 1 4.66-4.66 6 6 0 0 1 3.433.337 5.942 5.942 0 0 1 3.66 5.48 5.9 5.9 0 0 1-1.741 4.196"
          />
          <path
            fill="currentColor"
            d="M12.044 5.96c-.178 0-.366.06-.614.298L9.808 7.83c-.159.158-.218.316-.218.465 0 .376.386.732.732.732.149 0 .317-.07.475-.228l.336-.336s.08-.08.11-.08c.059 0 .059.08.059.149v4.71c0 .484.356.642.712.642s.702-.158.702-.643v-6.5c0-.554-.336-.781-.672-.781"
          />
    </svg>
  );
});

IcWarrantyBadge.displayName = 'IcWarrantyBadge';
