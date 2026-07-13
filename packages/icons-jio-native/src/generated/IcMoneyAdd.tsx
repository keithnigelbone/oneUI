import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoneyAdd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 7h1v1a1 1 0 0 0 2 0V7h1a1 1 0 1 0 0-2h-1V4a1 1 0 0 0-2 0v1h-1a1 1 0 1 0 0 2m-3-1q.004-.505.1-1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a5 5 0 0 1-8-4m-3 5a3 3 0 0 1-1.11 2.33l1.56.78A1 1 0 0 1 11 16a.93.93 0 0 1-.45-.11l-4-2A1 1 0 0 1 7 12h1a1 1 0 0 0 0-2H6a1 1 0 0 1 0-2h5a1 1 0 1 1 0 2h-.18a3 3 0 0 1 .18 1"
          />
    </Svg>
  );
}
