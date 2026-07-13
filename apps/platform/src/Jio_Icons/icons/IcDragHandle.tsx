import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcDragHandle = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M4.93 18.48c-.37 0-.73-.14-1.01-.42-.56-.56-.56-1.46 0-2.02L16.04 3.92c.56-.56 1.46-.56 2.02 0s.56 1.46 0 2.02L5.94 18.06c-.28.28-.64.42-1.01.42M10.99 20.5c-.37 0-.73-.14-1.01-.42-.56-.56-.56-1.46 0-2.02l8.08-8.08c.56-.56 1.46-.56 2.02 0s.56 1.46 0 2.02L12 20.08c-.28.28-.64.42-1.01.42"
    />
  </svg>
);
export default SvgIcDragHandle;
