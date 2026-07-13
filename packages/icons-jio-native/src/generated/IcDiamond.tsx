import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDiamond(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7a1 1 0 0 0 1-1V4a1 1 0 1 0-2 0v2a1 1 0 0 0 1 1m3.55-.11A.93.93 0 0 0 16 7a1 1 0 0 0 .89-.55l.5-1a1 1 0 1 0-1.78-.9l-.5 1a1 1 0 0 0 .44 1.34m-8.44-.44A1 1 0 0 0 8 7a.93.93 0 0 0 .45-.11 1 1 0 0 0 .44-1.34l-.5-1a1 1 0 0 0-1.78.9zm13.3 5.14-3-3A2 2 0 0 0 16 8H8a2 2 0 0 0-1.41.59l-3 3A2 2 0 0 0 3 13.08a2 2 0 0 0 .7 1.44l7 6a2 2 0 0 0 2.6 0l7-6a2 2 0 0 0 .7-1.44 2 2 0 0 0-.59-1.49"
          />
    </Svg>
  );
}
