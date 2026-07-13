import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCompact = forwardRef<SVGSVGElement, IconComponentProps>(function IcCompact(
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
            d="M14.466 7.047H9.519A2.473 2.473 0 0 0 7.046 9.52v4.947a2.473 2.473 0 0 0 2.473 2.474h4.947a2.473 2.473 0 0 0 2.473-2.474V9.52a2.473 2.473 0 0 0-2.473-2.473M21.7 2.286a.61.61 0 0 0-.877 0l-2.66 2.659v-.977a.61.61 0 0 0-.618-.619.61.61 0 0 0-.618.619V6.44c0 .346.272.618.618.618h2.474a.61.61 0 0 0 .618-.618.61.61 0 0 0-.618-.618h-.977l2.659-2.66a.61.61 0 0 0 0-.877M6.427 16.94H3.954a.61.61 0 0 0-.619.62c0 .346.272.617.619.617h.977l-2.647 2.66a.61.61 0 0 0 0 .878.62.62 0 0 0 .433.185.6.6 0 0 0 .433-.185l2.659-2.66v.978c0 .346.272.618.618.618a.61.61 0 0 0 .619-.618v-2.474a.61.61 0 0 0-.619-.618"
          />
    </svg>
  );
});

IcCompact.displayName = 'IcCompact';
