import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcParentalControlShield = forwardRef<SVGSVGElement, IconComponentProps>(function IcParentalControlShield(
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
            d="M19.852 4.662h.011a1.83 1.83 0 0 0-1.243-.671 17.7 17.7 0 0 1-6.127-1.804A1.7 1.7 0 0 0 11.701 2c-.264 0-.55.055-.792.187a17.5 17.5 0 0 1-6.094 1.804 1.94 1.94 0 0 0-1.265.627A2.02 2.02 0 0 0 3 5.971v4.95C3 17.587 9.523 21.8 11.69 21.8s8.69-4.202 8.69-10.879v-4.95c0-.473-.198-.957-.528-1.309m-5.918 6.754c.055-.187.154-.363.286-.506a.97.97 0 0 1 .506-.286 1.1 1.1 0 0 1 .572 0c.187.055.352.143.484.286.132.132.231.297.286.484s.055.385 0 .572a1.3 1.3 0 0 1-.286.506 1 1 0 0 1-.506.286 1.1 1.1 0 0 1-.572 0 1.03 1.03 0 0 1-.484-.286 1.14 1.14 0 0 1-.286-.484 1 1 0 0 1 0-.572M7.895 8.05c.099-.374.297-.726.572-1.001a2.23 2.23 0 0 1 1.001-.572 2.3 2.3 0 0 1 1.155 0c.363.099.693.297.968.561.264.264.462.605.561.968.11.374.11.781 0 1.155a2.23 2.23 0 0 1-.572 1.001 2.23 2.23 0 0 1-1.001.572 2.3 2.3 0 0 1-1.155 0 2.27 2.27 0 0 1-.968-.561 2.1 2.1 0 0 1-.561-.968 2.06 2.06 0 0 1 0-1.155m9.141 8.085a.56.56 0 0 1-.407.165H7.136a.96.96 0 0 1-.682-.286.99.99 0 0 1-.286-.682c0-1.023.407-1.991 1.122-2.717a3.85 3.85 0 0 1 2.717-1.122c1.023 0 1.991.407 2.717 1.122.352.352.627.77.814 1.221.396-.275.858-.44 1.342-.44.616 0 1.199.242 1.639.682s.682 1.023.682 1.639a.64.64 0 0 1-.165.418"
          />
    </svg>
  );
});

IcParentalControlShield.displayName = 'IcParentalControlShield';
