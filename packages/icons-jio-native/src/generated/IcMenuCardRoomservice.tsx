import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMenuCardRoomservice(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-1 15H8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2m0-4H8a1 1 0 0 1 0-2 4 4 0 0 1 3-3.86V7a1 1 0 0 1 2 0v.14A4 4 0 0 1 16 11a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
