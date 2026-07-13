import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMusicNote(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.56 3.17a1 1 0 0 0-.93-.1l-10 4A1 1 0 0 0 7 8v7.18A3.001 3.001 0 1 0 9 18V8.68l8-3.2v6.7A3.001 3.001 0 1 0 19 15V4a1 1 0 0 0-.44-.83"
          />
    </Svg>
  );
}
