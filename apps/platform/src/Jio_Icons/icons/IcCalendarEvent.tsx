import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcCalendarEvent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M18 3h-1a1 1 0 0 0-2 0H9a1 1 0 0 0-2 0H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-1.79 8.71-5 5a1 1 0 0 1-1.42 0l-2-2a1.003 1.003 0 1 1 1.42-1.42l1.29 1.3 4.29-4.3a1.004 1.004 0 0 1 1.42 1.42M19 7H5V6a1 1 0 0 1 1-1h1a1 1 0 0 0 2 0h6a1 1 0 0 0 2 0h1a1 1 0 0 1 1 1z"
    />
  </svg>
);
export default SvgIcCalendarEvent;
