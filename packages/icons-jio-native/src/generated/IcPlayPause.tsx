import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlayPause(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11.27 10.52 5 5.69a1.86 1.86 0 0 0-3 1.48v9.66a1.86 1.86 0 0 0 3 1.48l6.27-4.83a1.87 1.87 0 0 0 0-2.96M15.5 6A1.5 1.5 0 0 0 14 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 15.5 6m5 0A1.5 1.5 0 0 0 19 7.5v9a1.5 1.5 0 0 0 3 0v-9A1.5 1.5 0 0 0 20.5 6"
          />
    </Svg>
  );
}
