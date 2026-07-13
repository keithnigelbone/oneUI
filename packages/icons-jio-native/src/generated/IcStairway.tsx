import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStairway(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a8 8 0 0 0-8 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V10a8 8 0 0 0-8-8m6 18H6v-1a1 1 0 0 1 1-1h11zm0-4H8v-1a1 1 0 0 1 1-1h9zm0-4h-8v-1a1 1 0 0 1 1-1h7z"
          />
    </Svg>
  );
}
