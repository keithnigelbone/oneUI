import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRoomPurifyer(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 2H8a3 3 0 0 0-3 3v3h14V5a3 3 0 0 0-3-3m-4 4H8a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2M5 18a2 2 0 0 0 2 2v1a1 1 0 1 0 2 0v-1h6v1a1 1 0 0 0 2 0v-1a2 2 0 0 0 2-2v-8H5z"
          />
    </Svg>
  );
}
