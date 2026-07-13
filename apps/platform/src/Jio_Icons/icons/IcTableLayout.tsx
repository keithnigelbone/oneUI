import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcTableLayout = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M8 3H6C4.34 3 3 4.34 3 6v2h5zM10 21h8c1.66 0 3-1.34 3-3v-8H10zM21 8V6c0-1.66-1.34-3-3-3h-8v5zM3 10v8c0 1.66 1.34 3 3 3h2V10z"
    />
  </svg>
);
export default SvgIcTableLayout;
