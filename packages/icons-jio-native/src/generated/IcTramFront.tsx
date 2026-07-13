import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTramFront(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 4.34V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v.34A6 6 0 0 0 4 10v9a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-9a6 6 0 0 0-4-5.66M7 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4-5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm6 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
