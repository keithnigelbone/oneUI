import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcTest = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M18.5 2h-13a1.5 1.5 0 0 0 0 3H6v11a6 6 0 1 0 12 0V5h.5a1.5 1.5 0 0 0 0-3M16 10H8V5h8z"
    />
  </svg>
);
export default SvgIcTest;
