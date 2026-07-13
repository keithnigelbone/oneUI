import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTvOnline(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 6a1 1 0 0 1-2 0v-.59l-2.29 2.3a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095L16.59 9H16a1 1 0 1 1 0-2h3a1 1 0 0 1 .38.08 1 1 0 0 1 .54.54c.051.12.078.25.08.38zm-5 8H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
