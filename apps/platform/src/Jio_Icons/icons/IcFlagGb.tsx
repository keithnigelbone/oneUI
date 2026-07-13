import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcFlagGb = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <mask
          id='ic_flag_gb_svg__a'
          style={{
            maskType: 'alpha'
          }}
          maskUnits='userSpaceOnUse'
          x={0}
          y={0}
          width={24}
          height={24}
        >
          <circle cx={12} cy={12} r={12} fill='#C4C4C4' />
        </mask>
        <g mask='url(#ic_flag_gb_svg__a)'>
          <path d='M14.5 0h-5v9.5H0v5h9.5V24h5v-9.5H24v-5h-9.5V0z' fill='#C3283A' />
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M23.04 8H24v-.58l-.96.58zM24 2.18V0h-8v6.98l8-4.8zM8 6.98V0H0v2.18l8 4.8zM0 7.42V8h.96L0 7.42zM24 16.58V16h-.96l.96.58zM16 17.02V24h8v-2.18l-8-4.8zM.96 16H0v.58L.96 16zM0 21.82V24h8v-6.98l-8 4.8z'
            fill='#162667'
          />
          <path
            d='M24 17.68L21.21 16h-2.92L24 19.43v-1.75zM24 3.33L16.21 8h2.92L24 5.08V3.33zM0 4.53v1.75L2.88 8h2.91L0 4.53zM0 20.73L7.88 16H4.96L0 18.98v1.75z'
            fill='#C3283A'
          />
        </g>
  </svg>
);
export default SvgIcFlagGb;
