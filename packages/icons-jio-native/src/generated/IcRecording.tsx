import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRecording(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-3 11H8a3 3 0 1 1 2.82-2h2.33A3 3 0 1 1 16 15m-8-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2m8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
