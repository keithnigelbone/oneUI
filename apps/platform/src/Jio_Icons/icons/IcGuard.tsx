import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcGuard = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M19 15H5a1 1 0 0 0-1 1v1a1 1 0 0 0 .45.83l2.24 1.5a4 4 0 0 0 2.22.67h6.18a4 4 0 0 0 2.22-.67l2.24-1.5A1 1 0 0 0 20 17v-1a1 1 0 0 0-1-1m2.86-6.73a2 2 0 0 0-1.16-1.14l-8-3a2 2 0 0 0-1.4 0l-8 3a2 2 0 0 0-1.09 2.76l1 2A2 2 0 0 0 5 13h14a2 2 0 0 0 1.79-1.11l1-2a2 2 0 0 0 .07-1.62m-8.36.23a1.5 1.5 0 0 1-3 0V8a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1z"
    />
  </svg>
);
export default SvgIcGuard;
