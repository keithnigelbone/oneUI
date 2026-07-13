import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTriangleDown(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m3.27 7.01 7 12c.36.61 1.02.99 1.73.99s1.37-.38 1.73-.99l7-12c.36-.62.36-1.38 0-2s-1.02-1-1.73-1H5c-.72 0-1.38.38-1.73 1s-.35 1.39 0 2"
          />
    </Svg>
  );
}
