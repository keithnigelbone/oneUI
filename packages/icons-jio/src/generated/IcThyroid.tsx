import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcThyroid = forwardRef<SVGSVGElement, IconComponentProps>(function IcThyroid(
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
            d="M10.54 5a.49.49 0 0 0-.49.49v1.02c0 .27.22.49.49.49h2.93c.27 0 .49-.22.49-.49V5.49a.49.49 0 0 0-.49-.49zm2.93 15h-2.93a.49.49 0 0 0-.49.49v1.02c0 .27.22.49.49.49h2.93c.27 0 .49-.22.49-.49v-1.02a.49.49 0 0 0-.49-.49M9.69 3.97h4.62c.27 0 .49-.22.49-.49v-.96a.49.49 0 0 0-.49-.49H9.69a.49.49 0 0 0-.49.49v.96c0 .27.22.49.49.49m3.47 13.35c-.76-.42-1.59-.42-2.32 0-.24.15-.62.12-.8.34-.12.16 0 .8 0 .8 0 .3.22.54.49.54h2.93c.27 0 .49-.24.49-.54 0 0 .12-.64 0-.8-.17-.23-.55-.19-.8-.34zm6.22-5.81c0-.76-.32-1.49-.88-2.01.23-.85.05-1.76-.49-2.45a2.7 2.7 0 0 0-2.26-1.03c-.4 0-.77.21-.99.55-1.72 2.79-1.27 2.59-3.29 2.59-.4 0-.77-.21-.99-.55L9.22 6.58c-.93-1.5-4.53.16-3.74 2.93-.55.52-.87 1.25-.87 2.01s.31 1.49.87 2.01c-.23.84-.05 1.75.49 2.44s1.37 1.08 2.23 1.04c1.84 0 2.92-2.01 5.18-.87 1.07.54 1.55.87 2.4.87.87.03 1.7-.36 2.23-1.04.54-.69.72-1.59.49-2.44.55-.52.86-1.25.86-2.02z"
          />
    </svg>
  );
});

IcThyroid.displayName = 'IcThyroid';
