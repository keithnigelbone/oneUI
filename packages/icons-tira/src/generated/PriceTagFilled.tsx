import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const PriceTagFilled = forwardRef<SVGSVGElement, IconComponentProps>(function PriceTagFilled(
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
      <path d="M4.28517 12.3507C4.28371 12.6178 4.38918 12.8744 4.57805 13.0632L12.7682 21.2534C13.1587 21.6439 13.7919 21.6439 14.1824 21.2534L21.2535 14.1823C21.644 13.7918 21.644 13.1586 21.2535 12.7681L13.0588 4.57342C12.8726 4.38723 12.6205 4.28199 12.3572 4.28054L5.3295 4.24175C4.7772 4.2387 4.32701 4.68397 4.324 5.23627L4.28517 12.3507Z" fill="currentColor"/>
      <path d="M8.87909 7.46476C9.26962 7.85528 9.26962 8.48844 8.87909 8.87897C8.48857 9.26949 7.8554 9.26949 7.46488 8.87897C7.07435 8.48844 7.07435 7.85528 7.46488 7.46476C7.8554 7.07423 8.48857 7.07423 8.87909 7.46476Z" fill="white"/>
    </svg>
  );
});

PriceTagFilled.displayName = 'PriceTagFilled';
