import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcOverlappingLayout = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M8 9.99c0-2.21 1.79-4 4-4h2v-1c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h2z"
    />
    <path
      fill="currentColor"
      d="M18 7.99h-6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2"
    />
  </svg>
);
export default SvgIcOverlappingLayout;
