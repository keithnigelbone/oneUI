import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWifiEnable(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.6 8.36A12.38 12.38 0 0 0 12 4a12.27 12.27 0 0 0-9.6 4.37 2 2 0 0 0 .15 2.57l8 8.44A2 2 0 0 0 12 20a2 2 0 0 0 1.45-.62l8-8.44a2 2 0 0 0 .15-2.58"
          />
    </Svg>
  );
}
