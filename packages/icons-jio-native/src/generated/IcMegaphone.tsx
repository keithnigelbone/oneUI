import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMegaphone(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 4a1 1 0 0 0-1 1v.5L4 10a1 1 0 0 0-2 0v4a1 1 0 1 0 2 0l3 .85A1 1 0 0 0 7 15a4 4 0 0 0 7.47 2L20 18.5v.5a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1M11 17a2 2 0 0 1-1.95-1.58l3.4 1A2 2 0 0 1 11 17"
          />
    </Svg>
  );
}
