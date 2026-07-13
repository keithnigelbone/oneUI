import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMic(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3m6-5a1 1 0 0 0-1 1v1a5 5 0 1 1-10 0v-1a1 1 0 1 0-2 0v1a7 7 0 1 0 14 0v-1a1 1 0 0 0-1-1m-3 10H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
