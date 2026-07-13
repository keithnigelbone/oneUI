import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUsbStick(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 8h-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v5H6a1 1 0 0 0-1 1v10a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V9a1 1 0 0 0-1-1m-7-2.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5zm4 0a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"
          />
    </Svg>
  );
}
