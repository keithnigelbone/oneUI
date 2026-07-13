import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTrackEcg(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m0 13h-5.38l-.73 1.45a1 1 0 0 1-1.78 0L9 15.24l-.11.21A1 1 0 0 1 8 16H6a1 1 0 0 1 0-2h1.38l.73-1.45a1 1 0 0 1 1.78 0L11 14.76l.11-.21A1 1 0 0 1 12 14h6a1 1 0 0 1 0 2m0-6h-1.38l-.73 1.45a1 1 0 0 1-1.78 0L13 9.24l-.11.21A1 1 0 0 1 12 10H6a1 1 0 0 1 0-2h5.38l.73-1.45a1 1 0 0 1 1.78 0L15 8.76l.11-.21A1 1 0 0 1 16 8h2a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
