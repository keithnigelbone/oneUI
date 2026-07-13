import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFeaver(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 9.28V5a1 1 0 0 0-2 0v4.28A2 2 0 0 0 17 11a2 2 0 0 0 4 0 2 2 0 0 0-1-1.72M11 11a4.5 4.5 0 1 0-4.5-4.5A4.51 4.51 0 0 0 11 11m-1-4h2a1 1 0 1 1 0 2h-2a1 1 0 0 1 0-2m1 5a8 8 0 0 0-8 8 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-8-8"
          />
    </Svg>
  );
}
