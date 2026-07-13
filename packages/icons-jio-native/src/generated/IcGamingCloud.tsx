import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGamingCloud(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 10h10a2 2 0 1 0 0-4 4 4 0 0 0-7.49-1.92A1.7 1.7 0 0 0 9 4a2 2 0 0 0-2 2 2 2 0 1 0 0 4m15 6.51A5.15 5.15 0 0 0 16.78 12H7.22A5.15 5.15 0 0 0 2 16.51a5 5 0 0 0 8.66 3.85 1 1 0 0 1 .77-.36h1.1a1 1 0 0 1 .77.36 5 5 0 0 0 8.7-3.85M9 18H8v1a1 1 0 1 1-2 0v-1H5a1 1 0 0 1 0-2h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2m8-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
