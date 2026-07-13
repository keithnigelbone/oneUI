import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTriangle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.73 16.99-7-12C13.37 4.38 12.71 4 12 4s-1.37.38-1.73.99l-7 12c-.36.62-.36 1.38 0 2s1.02 1 1.73 1h14c.72 0 1.38-.38 1.73-1s.35-1.39 0-2"
          />
    </Svg>
  );
}
