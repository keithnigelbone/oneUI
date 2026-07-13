import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGasPiped(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 9a1 1 0 0 0-1 1h-3.54A6 6 0 0 0 13 8.09V6h1a1 1 0 1 0 0-2h-4a1 1 0 0 0 0 2h1v2.09A6 6 0 0 0 7.54 10H4a1 1 0 0 0-2 0v8a1 1 0 1 0 2 0h3.54a6 6 0 0 0 8.92 0H20a1 1 0 0 0 2 0v-8a1 1 0 0 0-1-1m-9 6.5a1.5 1.5 0 0 1-1.5-1.5v-.08l-1.21-1.21a1.004 1.004 0 0 1 1.42-1.42l1.21 1.22H12a1.5 1.5 0 1 1 0 3z"
          />
    </Svg>
  );
}
