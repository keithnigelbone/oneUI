import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcStar = forwardRef<SVGSVGElement, IconComponentProps>(function IcStar(
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
            d="M21.37 9.61a1.96 1.96 0 0 0-.58-.856 1.9 1.9 0 0 0-.94-.428l-4.235-.646-1.899-4.087a1.96 1.96 0 0 0-.702-.798 1.9 1.9 0 0 0-1.016-.295c-.361 0-.712.105-1.016.295a1.85 1.85 0 0 0-.703.798L8.38 7.68l-4.273.646c-.342.057-.674.2-.94.428a1.96 1.96 0 0 0-.58.855 1.91 1.91 0 0 0 .447 1.901l3.124 3.213-.74 4.553c-.058.351-.01.712.123 1.036.133.323.36.608.655.817.313.238.703.37 1.102.38.332 0 .655-.076.95-.237l3.788-2.091 3.788 2.09c.285.162.618.248.95.238a1.9 1.9 0 0 0 1.101-.351c.285-.21.513-.485.656-.818.133-.323.18-.684.123-1.036l-.74-4.552 3.123-3.213c.228-.257.37-.58.437-.922a1.9 1.9 0 0 0-.104-1.008"
          />
    </svg>
  );
});

IcStar.displayName = 'IcStar';
