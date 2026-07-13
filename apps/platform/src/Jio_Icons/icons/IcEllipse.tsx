import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcEllipse = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 20c5.523 0 10-3.582 10-8s-4.477-8-10-8S2 7.582 2 12s4.477 8 10 8"
    />
  </svg>
);
export default SvgIcEllipse;
