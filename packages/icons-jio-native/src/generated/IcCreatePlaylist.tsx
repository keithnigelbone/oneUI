import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCreatePlaylist(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 17H4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2M4 7h16a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m16 7h-2.5v-2.5a1 1 0 0 0-2 0V14H13a1 1 0 0 0 0 2h2.5v2.5a1 1 0 0 0 2 0V16H20a1 1 0 0 0 0-2m-10-3H4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
