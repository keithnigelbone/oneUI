import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDisplayLed(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-7 2h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2m3 7a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1M8 8a1 1 0 0 1 2 0v2a1 1 0 1 1-2 0zm1 9a1 1 0 0 1-1-1v-2a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1m4 2h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2m3-3a1 1 0 0 1-2 0v-2a1 1 0 0 1 2 0zm0-6a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
