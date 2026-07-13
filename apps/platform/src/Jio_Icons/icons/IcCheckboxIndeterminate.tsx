import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcCheckboxIndeterminate = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path fill="currentColor" d="M0 0h24v24H0z" />
    <path
      fill="#fff"
      d="M3.293 11.293A1 1 0 0 1 4 11h16a1 1 0 0 1 0 2H4a1 1 0 0 1-.707-1.707"
    />
  </svg>
);
export default SvgIcCheckboxIndeterminate;
