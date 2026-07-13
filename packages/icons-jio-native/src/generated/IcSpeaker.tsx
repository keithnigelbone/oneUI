import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSpeaker(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-5 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4m0 16a5 5 0 1 1 0-9.999A5 5 0 0 1 12 20m0-8a3 3 0 1 0 0 5.999A3 3 0 0 0 12 12"
          />
    </Svg>
  );
}
