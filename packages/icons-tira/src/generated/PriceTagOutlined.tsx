import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const PriceTagOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function PriceTagOutlined(
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
      <path d="M12.3574 4.28053C12.6207 4.28204 12.8725 4.38737 13.0586 4.5735L21.2539 12.7678C21.6441 13.1583 21.6441 13.7914 21.2539 14.1819L14.1826 21.2532C13.7922 21.6436 13.1591 21.6435 12.7686 21.2532L4.57814 13.0628C4.38941 12.874 4.28382 12.6178 4.28517 12.3508L4.32423 5.23561C4.32746 4.68363 4.77713 4.23864 5.32911 4.24147L12.3574 4.28053ZM5.48536 12.2737L13.4756 20.263L20.2637 13.4749L12.2686 5.47975L5.52247 5.44264L5.48536 12.2737ZM7.46486 7.46412C7.8553 7.07388 8.48843 7.07394 8.87892 7.46412C9.26944 7.85465 9.26944 8.48864 8.87892 8.87916C8.48844 9.26932 7.8553 9.26938 7.46486 8.87916C7.07433 8.48864 7.07433 7.85465 7.46486 7.46412Z" fill="currentColor"/>
    </svg>
  );
});

PriceTagOutlined.displayName = 'PriceTagOutlined';
