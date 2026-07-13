import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUsbCable(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 17h-1.28A2 2 0 0 0 16 16h-2a2 2 0 0 0-2 2H8.5a2.5 2.5 0 0 1 0-5h7a4.5 4.5 0 1 0 0-9H12a2 2 0 0 0-2-2H8a2 2 0 0 0-1.72 1H5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1.28A2 2 0 0 0 8 8h2a2 2 0 0 0 2-2h3.5a2.5 2.5 0 0 1 0 5h-7a4.5 4.5 0 1 0 0 9H12a2 2 0 0 0 2 2h2a2 2 0 0 0 1.72-1H19a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
