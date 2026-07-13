import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHdr(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 8a1 1 0 0 0-1 1v2H4V9a1 1 0 0 0-2 0v6a1 1 0 1 0 2 0v-2h2v2a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1m14.16 5.08A3 3 0 0 0 19 8h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0v-1h1q.18.015.36 0l.75 1.49A1 1 0 0 0 21 16a.93.93 0 0 0 .45-.11 1 1 0 0 0 .44-1.34zM19 12h-1v-2h1a1 1 0 0 1 0 2m-7-4h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2c1 0 3-.84 3-4s-2-4-3-4m0 6h-1v-4h1c.17 0 1 .16 1 2s-.83 2-1 2"
          />
    </Svg>
  );
}
