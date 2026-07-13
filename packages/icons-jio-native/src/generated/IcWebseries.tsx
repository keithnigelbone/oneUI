import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWebseries(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 4h10a1 1 0 1 0 0-2H7a1 1 0 0 0 0 2M5 8h14a1 1 0 1 0 0-2H5a1 1 0 0 0 0 2m14 2H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3m-4.45 6.83-3 2A1 1 0 0 1 10 18v-4a1 1 0 0 1 .53-.88 1 1 0 0 1 1 .05l3 2a1 1 0 0 1 0 1.66z"
          />
    </Svg>
  );
}
