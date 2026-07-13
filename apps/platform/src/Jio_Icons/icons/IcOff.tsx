import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcOff = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 14a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0z"
    />
  </svg>
);
export default SvgIcOff;
