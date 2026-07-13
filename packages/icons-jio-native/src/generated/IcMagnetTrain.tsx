import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMagnetTrain(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 20H6a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2m6-18h-4a6 6 0 0 0-6 6v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a6 6 0 0 0-6-6M7 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4-5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm6 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm0 10h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
