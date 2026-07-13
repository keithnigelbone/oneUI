import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ChevronLeftOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function ChevronLeftOutlined(
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
      <path d="M16.4239 19.5757C16.6582 19.81 16.6582 20.19 16.4239 20.4243C16.1896 20.6586 15.8095 20.6586 15.5752 20.4243L7.85844 12.7066C7.46805 12.316 7.46796 11.683 7.85844 11.2925L15.5752 3.5757C15.8096 3.34139 16.1896 3.34139 16.4239 3.5757C16.6582 3.81001 16.6582 4.19002 16.4239 4.42433L8.8477 11.9995L16.4239 19.5757Z" fill="currentColor"/>
    </svg>
  );
});

ChevronLeftOutlined.displayName = 'ChevronLeftOutlined';
