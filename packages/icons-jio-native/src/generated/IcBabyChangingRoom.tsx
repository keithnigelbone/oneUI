import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBabyChangingRoom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M8.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M12 9a1 1 0 0 0-1-1H8.42L6.71 6.29a1 1 0 0 0-.9-.29 1 1 0 0 0-.73.61l-2 5A.9.9 0 0 0 3 12v8a1 1 0 1 0 2 0v-7.81l1.37-3.41.93.93A1 1 0 0 0 8 10h3a1 1 0 0 0 1-1m0 7h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-2 0v1h-2.59l-1.7-1.71a1.004 1.004 0 1 0-1.42 1.42l2 2A1 1 0 0 0 12 16m8 2h-8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
