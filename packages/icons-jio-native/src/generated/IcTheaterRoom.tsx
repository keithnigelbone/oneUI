import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTheaterRoom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 12h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1m14 2H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2M5.5 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3M14 18h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m4.5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
