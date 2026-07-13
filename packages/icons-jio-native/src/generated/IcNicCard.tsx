import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNicCard(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 6H6a3 3 0 0 0-3-3 1 1 0 0 0 0 2 1 1 0 0 1 1 1v3H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1v4a1 1 0 1 0 2 0v-1h4v1a1 1 0 0 0 2 0v-1h2v1a1 1 0 0 0 2 0v-1h2v1a1 1 0 0 0 2 0v-1.18A3 3 0 0 0 22 15V9a3 3 0 0 0-3-3m0 6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
