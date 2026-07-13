import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcKitchen(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 9h6a1 1 0 0 0 .92-.62 1 1 0 0 0-.21-1.09L11 5.59V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1.59l-1.71 1.7a1 1 0 0 0-.21 1.09A1 1 0 0 0 6 9m13 4v-1a3 3 0 0 0-3-3 1 1 0 1 0 0 2 1 1 0 0 1 1 1v1h-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m-6 1.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5z"
          />
    </Svg>
  );
}
