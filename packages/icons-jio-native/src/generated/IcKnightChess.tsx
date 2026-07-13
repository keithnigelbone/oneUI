import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcKnightChess(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m16.44 11.54.61.2a2.11 2.11 0 0 0 2.76-2.24 2.07 2.07 0 0 0-1-1.57l-5.5-3.31.59-1.17a1 1 0 0 0-.13-1.09A1 1 0 0 0 12.71 2a10.92 10.92 0 0 0-6 5.11c-1.43 2.74-1.52 6.08-.29 9.92A3 3 0 0 0 4 20v1a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-1a3 3 0 0 0-2.81-3c.42-1.07-.15-2.61-1.81-4.84a.11.11 0 0 1 0-.14 2 2 0 0 1 2.06-.48"
          />
    </Svg>
  );
}
