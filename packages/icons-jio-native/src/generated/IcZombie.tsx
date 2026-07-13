import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcZombie(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4a1 1 0 0 0-1 1v2.33a.66.66 0 0 1-.66.67.67.67 0 0 1-.67-.67V4a1 1 0 1 0-2 0v3.33a.67.67 0 0 1-.925.619.66.66 0 0 1-.405-.619V3a1 1 0 1 0-2 0v4.33a.66.66 0 0 1-.66.67.67.67 0 0 1-.68-.67V4a1 1 0 1 0-2 0v4a1 1 0 0 1-2 0V7a1 1 0 0 0-2 0v3a4.94 4.94 0 0 0 1 3 5 5 0 0 0 4 2v1.17A3 3 0 0 0 10 22a2.76 2.76 0 0 0 2-.79 3 3 0 1 0 3-5V15a5 5 0 0 0 4-2 4.94 4.94 0 0 0 1-3V5a1 1 0 0 0-1-1m-5 16a1 1 0 0 1-.68-.26 2 2 0 0 0-2.64 0A1 1 0 0 1 10 20a1 1 0 0 1 0-2 1 1 0 0 0 1-1v-2h2v2a1 1 0 0 0 1 1 1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
