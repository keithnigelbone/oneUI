import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CallFilled = forwardRef<SVGSVGElement, IconComponentProps>(function CallFilled(
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
      <path d="M11.4929 17.9554C13.8998 20.3622 17.0633 20.3912 18.7494 18.7052L20.1578 17.2968C21.1732 16.2814 21.1732 14.6352 20.1578 13.6198L19.4139 12.8759C18.3952 11.8572 16.7425 11.861 15.7285 12.8844L15.0402 13.5791C14.8842 13.7365 14.6299 13.7371 14.4732 13.5804L10.2808 9.38797C10.1251 9.23227 10.1245 8.98001 10.2795 8.82359L10.9873 8.10924C11.9946 7.09253 11.9908 5.45283 10.9788 4.44078L10.3258 3.78777C9.31041 2.7724 7.66418 2.77241 6.64882 3.78777L5.24042 5.19617C3.56793 6.86866 3.60715 10.0696 5.88628 12.3487L11.4929 17.9554Z" fill="currentColor"/>
    </svg>
  );
});

CallFilled.displayName = 'CallFilled';
