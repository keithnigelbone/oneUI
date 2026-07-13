import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUsbDongle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 8h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m5-3.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-4 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm9 5.5H6a1 1 0 0 0-1 1v4a7 7 0 1 0 14 0v-4a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
