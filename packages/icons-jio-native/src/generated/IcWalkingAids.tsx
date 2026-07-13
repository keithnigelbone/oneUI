import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWalkingAids(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 3h-1a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1H8a4 4 0 0 0-4 4v11.28A2 2 0 0 0 3 20a2 2 0 0 0 4 0 2 2 0 0 0-1-1.72V16h12v5a1 1 0 0 0 2 0V7a4 4 0 0 0-4-4m-5 11H6v-3h5zm7 0h-5v-3h5zm0-5H6V7a2 2 0 0 1 2-2h1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1h1a2 2 0 0 1 2 2z"
          />
    </Svg>
  );
}
