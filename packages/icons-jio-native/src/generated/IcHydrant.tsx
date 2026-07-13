import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHydrant(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 11h-1a1 1 0 0 0-1-1h-1V8a1 1 0 1 0 0-2h-.1a5 5 0 0 0-9.8 0H7a1 1 0 1 0 0 2v2H6a1 1 0 0 0-1 1H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1 1h1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-5h1a1 1 0 0 0 1-1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1m-8 4a2 2 0 1 1 0-4 2 2 0 0 1 0 4"
          />
    </Svg>
  );
}
