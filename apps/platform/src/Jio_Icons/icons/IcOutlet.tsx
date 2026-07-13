import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcOutlet = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M8 16.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M12 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m4 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
    />
  </svg>
);
export default SvgIcOutlet;
