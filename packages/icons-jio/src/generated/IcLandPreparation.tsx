import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLandPreparation = forwardRef<SVGSVGElement, IconComponentProps>(function IcLandPreparation(
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
            d="M20.45 13.28c-.28-.14-1.89-.78-5.82.79-1.7.68-2.46 0-3.88-1.59S7.4 8.81 3.68 10.05A1 1 0 0 0 3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5.83a1 1 0 0 0-.55-.89M14 12h1.17a3 3 0 0 0 2.12-.88l2.42-2.41a1 1 0 0 0 0-1.42l-.8-.79 1.8-1.79a1.004 1.004 0 1 0-1.42-1.42l-1.79 1.8-.79-.8a1 1 0 0 0-1.42 0l-2.41 2.42A3 3 0 0 0 12 8.83V10a2 2 0 0 0 2 2"
          />
    </svg>
  );
});

IcLandPreparation.displayName = 'IcLandPreparation';
