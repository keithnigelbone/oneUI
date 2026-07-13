import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStroller(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 8h8V4a1 1 0 0 0-1-1h-1a7 7 0 0 0-6.45 4.29A.5.5 0 0 0 4 8m3.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M20 6h-2a1 1 0 0 0-1 .76L16.22 10H4a1 1 0 0 0-1 1v1a5 5 0 0 0 5 5h5a5 5 0 0 0 5-5v-.88L18.78 8H20a1 1 0 1 0 0-2m-6.5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </Svg>
  );
}
