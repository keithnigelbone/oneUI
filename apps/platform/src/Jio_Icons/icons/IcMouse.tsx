import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcMouse = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 2a6 6 0 0 0-6 6v8a6 6 0 1 0 12 0V8a6 6 0 0 0-6-6m1 6a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0z"
    />
  </svg>
);
export default SvgIcMouse;
