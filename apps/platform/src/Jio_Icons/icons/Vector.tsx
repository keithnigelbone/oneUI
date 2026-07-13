import * as React from 'react';
import type { SVGProps } from 'react';
const SvgVector = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <path
      fill="currentColor"
      d="M4 12H2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2m5-6c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1S8 .45 8 1v4c0 .55.45 1 1 1m7-6h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2M2 6h2c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2H2C.9 0 0 .9 0 2v2c0 1.1.9 2 2 2m14 2h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2m1 8h-7v-6c0-1.1-.9-2-2-2H1c-.55 0-1 .45-1 1s.45 1 1 1h7v6c0 1.1.9 2 2 2h7c.55 0 1-.45 1-1s-.45-1-1-1"
    />
  </svg>
);
export default SvgVector;
