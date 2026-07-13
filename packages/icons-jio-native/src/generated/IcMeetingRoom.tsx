import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMeetingRoom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-2 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m-5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3M7 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m12 8H5a1 1 0 0 1-1-1 3 3 0 0 1 5.5-1.65 3 3 0 0 1 5 0A3 3 0 0 1 20 15a1 1 0 0 1-1 1"
          />
    </Svg>
  );
}
