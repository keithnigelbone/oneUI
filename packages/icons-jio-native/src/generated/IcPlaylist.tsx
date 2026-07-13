import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlaylist(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 7h9a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m0 6h9a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m16.58-7.81a1 1 0 0 0-.9-.14l-3 1A1 1 0 0 0 16 7v8.05a2.5 2.5 0 1 0 2 2.45V8.72L20.32 8A1 1 0 0 0 21 7V6a1 1 0 0 0-.42-.81M10 17H4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
