import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlaylistAdd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 7h6a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m9 3h2.5v2.5a1 1 0 0 0 2 0V10H20a1 1 0 1 0 0-2h-2.5V5.5a1 1 0 0 0-2 0V8H13a1 1 0 1 0 0 2m-9 3h6a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2m16 4H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
