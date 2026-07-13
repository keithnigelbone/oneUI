import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHeatSensor = forwardRef<SVGSVGElement, IconComponentProps>(function IcHeatSensor(
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
            d="M18.91 4.87c-.06-.12-.14-.23-.24-.32A10 10 0 0 0 12 2c-2.46 0-4.84.91-6.67 2.55a.987.987 0 0 0-.07 1.41.987.987 0 0 0 1.41.07A8 8 0 0 1 12 4c1.97 0 3.86.72 5.33 2.03.18.16.42.25.67.25a.976.976 0 0 0 .74-.3c.09-.1.16-.21.21-.34s.07-.26.06-.4c0-.13-.04-.27-.1-.39z"
          />
          <path
            fill="currentColor"
            d="M11.99 5.02c-1.3 0-2.57.42-3.61 1.21-.1.08-.19.18-.26.29s-.11.24-.13.37 0 .26.03.39.09.25.17.35a.98.98 0 0 0 1.05.35.9.9 0 0 0 .35-.17 4.03 4.03 0 0 1 2.39-.79c.86 0 1.7.28 2.39.79.21.16.48.23.74.2s.5-.17.66-.38.23-.48.2-.74a.98.98 0 0 0-.38-.66 6.03 6.03 0 0 0-3.61-1.21z"
          />
          <path
            fill="currentColor"
            d="M14 14.55V10c0-1.1-.9-2-2-2s-2 .9-2 2v4.55c-1.19.69-2 1.97-2 3.45 0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.48-.81-2.75-2-3.45M12 20c-1.1 0-2-.9-2-2 0-.93.64-1.71 1.5-1.93V10.5c0-.28.22-.5.5-.5s.5.22.5.5v5.57c.86.22 1.5 1 1.5 1.93 0 1.1-.9 2-2 2"
          />
    </svg>
  );
});

IcHeatSensor.displayName = 'IcHeatSensor';
