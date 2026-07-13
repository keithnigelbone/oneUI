import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPortrait(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 2H8C6.34 2 5 3.34 5 5v14c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3m-4 6c.83 0 1.5.67 1.5 1.5S12.83 11 12 11s-1.5-.67-1.5-1.5S11.17 8 12 8m2 8h-4c-.55 0-1-.45-1-1 0-1.66 1.34-3 3-3s3 1.34 3 3c0 .55-.45 1-1 1"
          />
    </Svg>
  );
}
