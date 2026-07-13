import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTrainFront(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 5.09V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v.09A6 6 0 0 0 3 11v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a6 6 0 0 0-5-5.91M6 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m5-5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm7 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
