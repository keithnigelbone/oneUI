import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNetwork(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 15h-1v-2a2 2 0 0 0-2-2h-3V9h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v2H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H8v-2h8v2h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
