import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlug(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m5 12a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-4a1 1 0 0 1 1-1h1V7a1 1 0 0 1 2 0v2h2V7a1 1 0 0 1 2 0v2h1a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
