import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBabyMonitor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0-5a7 7 0 0 0-3 .68V3a1 1 0 0 0-2 0v3a.3.3 0 0 0 0 .09A6.94 6.94 0 0 0 5 11v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-8a7 7 0 0 0-7-7M9 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2m6 0h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2m-3-4a4 4 0 1 1 0-8 4 4 0 0 1 0 8"
          />
    </Svg>
  );
}
