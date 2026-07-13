import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGift(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 18a3 3 0 0 0 3 3h3v-8H5zM20 7h-1.18A3 3 0 0 0 16 3h-2a3 3 0 0 0-2 .78A3 3 0 0 0 10 3H8a3 3 0 0 0-2.82 4H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1m-9 0H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1zm5 0h-3V6a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2m-3 14h3a3 3 0 0 0 3-3v-5h-6z"
          />
    </Svg>
  );
}
