import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVideoResize(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 14H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2m9-10H5a3 3 0 0 0-3 3v5.56A3.9 3.9 0 0 1 4 12h6a4 4 0 0 1 4 4v2a3.9 3.9 0 0 1-.56 2H19a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m1 6a1 1 0 0 1-2 0v-.59l-2.29 2.3a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095L16.59 8H16a1 1 0 1 1 0-2h3a1 1 0 0 1 .38.08 1 1 0 0 1 .54.54c.051.12.078.25.08.38z"
          />
    </Svg>
  );
}
