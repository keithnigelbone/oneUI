import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcBatteryWarning = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 9c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1v-3c0-.55-.45-1-1-1m-.71 6.29c-.18.19-.29.44-.29.71 0 .13.03.26.08.38q.075.18.21.33.15.135.33.21c.12.06.25.08.38.08s.26-.02.38-.08q.18-.075.33-.21A1 1 0 0 0 13 16c0-.27-.11-.52-.29-.71-.37-.37-1.05-.37-1.42 0M16 4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2-1.65 0-3 1.35-3 3v12c0 1.65 1.35 3 3 3h8c1.65 0 3-1.35 3-3V7c0-1.65-1.35-3-3-3m1 15c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h1c.55 0 1-.45 1-1V4h4v1c0 .55.45 1 1 1h1c.55 0 1 .45 1 1z"
    />
  </svg>
);
export default SvgIcBatteryWarning;
