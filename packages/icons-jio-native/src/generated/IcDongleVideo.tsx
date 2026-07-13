import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDongleVideo(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 19a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V9H4zM9 2H7a3 3 0 0 0-3 3v2h8V5a3 3 0 0 0-3-3m10.6 9.2-4-3a1 1 0 0 0-1-.09A1 1 0 0 0 14 9v6a1 1 0 0 0 .55.89 1 1 0 0 0 1-.09l4-3a1 1 0 0 0 0-1.6z"
          />
    </Svg>
  );
}
