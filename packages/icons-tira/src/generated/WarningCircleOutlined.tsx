import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const WarningCircleOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function WarningCircleOutlined(
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
      <path d="M12.0671 6.30005C12.3985 6.30005 12.6671 6.56868 12.6671 6.90005V13.9C12.6671 14.2314 12.3985 14.5 12.0671 14.5C11.7358 14.5 11.4671 14.2314 11.4671 13.9V6.90005C11.4671 6.56868 11.7358 6.30005 12.0671 6.30005Z" fill="currentColor"/>
      <path d="M12.067 17.1C12.3984 17.1 12.667 16.8314 12.667 16.5C12.667 16.1687 12.3984 15.9 12.067 15.9C11.7357 15.9 11.467 16.1687 11.467 16.5C11.467 16.8314 11.7357 17.1 12.067 17.1Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 22C17.523 22 22.0002 17.5228 22.0002 11.9999C22.0002 6.47696 17.523 1.99976 12.0001 1.99976C6.47721 1.99976 2 6.47696 2 11.9999C2 17.5228 6.47721 22 12.0001 22ZM12.0001 20.8C16.8603 20.8 20.8002 16.8601 20.8002 11.9999C20.8002 7.1397 16.8603 3.19976 12.0001 3.19976C7.13995 3.19976 3.2 7.1397 3.2 11.9999C3.2 16.8601 7.13995 20.8 12.0001 20.8Z" fill="currentColor"/>
    </svg>
  );
});

WarningCircleOutlined.displayName = 'WarningCircleOutlined';
