import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTvPlus(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m6.41-13.41A2 2 0 0 0 20 5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-.59-1.41m-1.7 5.12A1 1 0 0 1 19 11h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1V8a1 1 0 0 1 2 0v1h1a1 1 0 0 1 .71 1.71"
          />
    </Svg>
  );
}
