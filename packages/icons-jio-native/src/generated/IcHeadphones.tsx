import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHeadphones(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 11h-1v-1a7 7 0 1 0-14 0v1H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-7a5 5 0 1 1 10 0v7a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
