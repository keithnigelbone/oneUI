import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGayser(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v3h4.14a4 4 0 0 1 7.72 0H20V5a3 3 0 0 0-3-3m-5 11a4 4 0 0 1-3.86-3H4v7a3 3 0 0 0 3 3h1v1a1 1 0 1 0 2 0v-1h4v1a1 1 0 0 0 2 0v-1h1a3 3 0 0 0 3-3v-7h-4.14A4 4 0 0 1 12 13m2 4h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m0-8a2 2 0 1 0-4 0 2 2 0 0 0 4 0"
          />
    </Svg>
  );
}
