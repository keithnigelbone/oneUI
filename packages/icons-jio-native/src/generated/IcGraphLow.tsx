import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGraphLow(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 15H5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1m6-4h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1m6-4h-2a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1M6 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
          />
    </Svg>
  );
}
