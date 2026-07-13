import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcToiletSeat(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 4c0-1.1-.9-2-2-2s-2 .9-2 2v8h4zm10 6h-6c-1.1 0-2 .9-2 2h10c0-1.1-.9-2-2-2m-4 4H4v1c0 3.87 3.13 7 7 7h3c.55 0 1-.45 1-1v-1h1c2.21 0 4-1.79 4-4v-2z"
          />
    </Svg>
  );
}
