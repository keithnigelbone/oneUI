import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCartPreorder(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8.5 19a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m8.5-7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m1.5 6a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h1v-1.5a1 1 0 0 1 2 0zM17 10a6.9 6.9 0 0 1 4 1.28l.88-2.65a2 2 0 0 0-1-2.41A2 2 0 0 0 20 6H6.58l-.41-1.52A2 2 0 0 0 4.23 3H3a1 1 0 1 0 0 2h1.23l2.83 10.48a2 2 0 0 0 .71 1.09A2 2 0 0 0 9 17h1a7 7 0 0 1 7-7"
          />
    </Svg>
  );
}
