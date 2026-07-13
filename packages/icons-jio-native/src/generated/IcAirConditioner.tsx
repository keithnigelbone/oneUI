import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAirConditioner(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 15a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1m-4 0a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 0 0 2 3 3 0 0 0 3-3v-1a1 1 0 0 0-1-1m10 3a1 1 0 0 1-1-1v-1a1 1 0 0 0-2 0v1a3 3 0 0 0 3 3 1 1 0 0 0 0-2m0-14H6a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-1 6H7a1 1 0 0 1 0-2h10a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
