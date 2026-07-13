import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCastMedia(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3.5 16a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0-3H3a1 1 0 0 0 0 2h.5A2.5 2.5 0 0 1 6 17.5v.5a1 1 0 1 0 2 0v-.5A4.51 4.51 0 0 0 3.5 13M19 5H5a3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-6a1 1 0 0 0 0 2h6a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3M3.5 10H3a1 1 0 0 0 0 2h.5A5.51 5.51 0 0 1 9 17.5v.5a1 1 0 1 0 2 0v-.5A7.5 7.5 0 0 0 3.5 10"
          />
    </Svg>
  );
}
