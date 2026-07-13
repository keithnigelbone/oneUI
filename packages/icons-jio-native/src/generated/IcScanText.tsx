import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcScanText(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 7H7a1 1 0 0 0 0 2h10a1 1 0 1 0 0-2m0 4H7a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2M3 8a1 1 0 0 0 1-1V5a1 1 0 0 1 1-1h2a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v2a1 1 0 0 0 1 1m4 12H5a1 1 0 0 1-1-1v-2a1 1 0 1 0-2 0v2a3 3 0 0 0 3 3h2a1 1 0 0 0 0-2m6-5H7a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m6-13h-2a1 1 0 1 0 0 2h2a1 1 0 0 1 1 1v2a1 1 0 0 0 2 0V5a3 3 0 0 0-3-3m2 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0 0 2h2a3 3 0 0 0 3-3v-2a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
