import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSofa(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5h14zm2 2a1 1 0 0 0-1 1v3H4v-3a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1h1v1a1 1 0 1 0 2 0v-1h12v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
