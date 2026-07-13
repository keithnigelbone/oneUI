import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTranscript(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5C3.34 4 2 5.34 2 7v9.99c0 1.66 1.34 3 3 3h13.99c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3zM5 11h2c.55 0 1 .45 1 1s-.45 1-1 1H5c-.55 0-1-.45-1-1s.45-1 1-1m8 6H5c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1m6 0h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1s-.45 1-1 1m0-4h-8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1"
          />
    </Svg>
  );
}
