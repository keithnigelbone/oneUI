import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.12 4.88A3 3 0 0 0 19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-.88-2.12M11.5 15a1 1 0 0 1-2 0v-2h-2v2a1 1 0 0 1-.62.93 1 1 0 0 1-1.31-.54A1 1 0 0 1 5.5 15V9a1 1 0 0 1 .62-.93 1 1 0 0 1 1.31.54A1 1 0 0 1 7.5 9v2h2V9a1 1 0 0 1 2 0zm4.5 1h-2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2c1 0 3 .84 3 4s-2 4-3 4m0-6h-1v4h1c.19 0 1-.16 1-2s-.83-2-1-2"
          />
    </Svg>
  );
}
