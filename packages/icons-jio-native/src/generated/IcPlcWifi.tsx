import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlcWifi(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3h-6a3 3 0 0 0-3 3H7a1 1 0 0 0-1 1v1H4a1 1 0 0 0 0 2h2v2H4a1 1 0 0 0 0 2h2v1a1 1 0 0 0 1 1h2v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-3 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2.86-3.92a1 1 0 0 1-1.37.35 2.81 2.81 0 0 0-3 0 1 1 0 1 1-1-1.72 4.82 4.82 0 0 1 5 0 1 1 0 0 1 .37 1.37M18.93 9a1 1 0 0 1-.93.62 1 1 0 0 1-.38-.07 6.9 6.9 0 0 0-5.24 0 1 1 0 0 1-.76-1.85 8.9 8.9 0 0 1 6.76 0 1 1 0 0 1 .55 1.3"
          />
    </Svg>
  );
}
