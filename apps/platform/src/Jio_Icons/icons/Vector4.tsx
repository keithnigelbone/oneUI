import * as React from 'react';
import type { SVGProps } from 'react';
const SvgVector4 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      fill="currentColor"
      d="M19 14h-1V8A8 8 0 0 0 2 8v6H1a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2m-9 6a3 3 0 0 0 3-3H7a3 3 0 0 0 3 3"
    />
  </svg>
);
export default SvgVector4;
