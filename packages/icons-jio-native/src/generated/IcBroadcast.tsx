import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBroadcast(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 11.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M12 3a10 10 0 0 0-7.07 17.07 1 1 0 1 0 1.41-1.41 8 8 0 1 1 11.32 0 1 1 0 0 0 0 1.41 1 1 0 0 0 1.41 0A10 10 0 0 0 12 3m0 4a6 6 0 0 0-6 6 5.93 5.93 0 0 0 1.76 4.24 1 1 0 1 0 1.41-1.41 4 4 0 1 1 5.66 0 1 1 0 0 0 0 1.41 1 1 0 0 0 1.41 0A5.93 5.93 0 0 0 18 13a6 6 0 0 0-6-6"
          />
    </Svg>
  );
}
