import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRechargeHistory(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10m1.5 6a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h1v-1.5a1 1 0 0 1 2 0zM19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h5.29a7 7 0 0 1-.29-2 7.2 7.2 0 0 1 .18-1.56.4.4 0 0 1-.13 0l-4-2a1 1 0 0 1 .45-1.94h1a1 1 0 0 0 0-2h-2a1 1 0 0 1 0-2h5a1 1 0 1 1 0 2h-.18a3 3 0 0 1-.93 3.33l1.51.75A6.998 6.998 0 0 1 22 12.11V8a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
