import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcLayout = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M3 18c0 1.66 1.34 3 3 3h8V10H3zM18 3H6C4.34 3 3 4.34 3 6v2h18V6c0-1.66-1.34-3-3-3m-2 18h2c1.66 0 3-1.34 3-3v-8h-5z"
    />
  </svg>
);
export default SvgIcLayout;
