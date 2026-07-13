import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CloseOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function CloseOutlined(
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
      <path d="M18.8828 4.26874C19.1171 4.03443 19.4971 4.03446 19.7314 4.26874C19.9657 4.50305 19.9657 4.88305 19.7314 5.11737L12.5019 12.3459L19.7314 19.5754C19.9657 19.8097 19.9656 20.1897 19.7314 20.424C19.4971 20.6583 19.1171 20.6583 18.8828 20.424L11.6533 13.1945L4.42476 20.424C4.19044 20.6583 3.81044 20.6583 3.57612 20.424C3.34184 20.1897 3.34182 19.8097 3.57612 19.5754L10.8046 12.3459L3.57612 5.11737C3.34182 4.88305 3.34181 4.50305 3.57612 4.26874C3.81044 4.03453 4.19047 4.03447 4.42476 4.26874L11.6533 11.4973L18.8828 4.26874Z" fill="currentColor"/>
    </svg>
  );
});

CloseOutlined.displayName = 'CloseOutlined';
