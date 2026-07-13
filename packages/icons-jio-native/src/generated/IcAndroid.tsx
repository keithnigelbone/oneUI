import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAndroid(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 10a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1m2 6a4 4 0 0 0 3 3.86V21a1 1 0 1 0 2 0v-1h4v1a1 1 0 1 0 2 0v-1.14A4 4 0 0 0 19 16v-4H5zM18.71 2.29a1 1 0 0 0-1.42 0l-1.1 1.11a7 7 0 0 0-8.38 0l-1.1-1.11a1.004 1.004 0 1 0-1.42 1.42l1.11 1.1A6.94 6.94 0 0 0 5 9v2h14V9a6.94 6.94 0 0 0-1.4-4.19l1.11-1.1a1 1 0 0 0 0-1.42M10 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m7 2a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
