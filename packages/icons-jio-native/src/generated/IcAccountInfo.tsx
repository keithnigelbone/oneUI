import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAccountInfo(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 12a5 5 0 0 0-5 5 2 2 0 0 0 2 2h6a2 2 0 0 0 2-2 5 5 0 0 0-5-5m0-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6m14 4h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 0-2m0-6a1 1 0 1 0 0-2h-8a1 1 0 1 0 0 2zm0 2h-7a1 1 0 0 0 0 2h7a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
