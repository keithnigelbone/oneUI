import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWps(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8.17 16.93A5 5 0 1 1 14 12a1 1 0 0 0 2 0 7 7 0 1 0-8.17 6.9H8a1 1 0 0 0 1-.84 1 1 0 0 0-.83-1.13m8-11.83a1 1 0 1 0-.35 1.97A5 5 0 1 1 10 12a1 1 0 1 0-2 0 7 7 0 0 0 3.5 6.06A6.93 6.93 0 0 0 15 19a7 7 0 0 0 1.17-13.9"
          />
    </Svg>
  );
}
