import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAirDry(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 9a1 1 0 0 0 1 1 8.7 8.7 0 0 0 4.45-1.11A6.77 6.77 0 0 1 20 8a1 1 0 1 0 0-2 8.7 8.7 0 0 0-4.45 1.11A6.77 6.77 0 0 1 12 8a1 1 0 0 0-1 1m-2 8V9a3 3 0 0 1 2.93-3l-1.64-2.6a1 1 0 0 0-1.58 0L4.2 10.54A7.85 7.85 0 0 0 3 14.69 6.42 6.42 0 0 0 9.5 21a6.6 6.6 0 0 0 3.5-1h-1a3 3 0 0 1-3-3m11-7a8.7 8.7 0 0 0-4.45 1.11A6.77 6.77 0 0 1 12 12a1 1 0 1 0 0 2 8.7 8.7 0 0 0 4.45-1.11A6.77 6.77 0 0 1 20 12a1 1 0 0 0 0-2m0 4a8.7 8.7 0 0 0-4.45 1.11A6.77 6.77 0 0 1 12 16a1 1 0 1 0 0 2 8.7 8.7 0 0 0 4.45-1.11A6.77 6.77 0 0 1 20 16a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
