import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSoundQuiet(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13.8 4.4 9 8H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2l4.8 3.6A2 2 0 0 0 17 18V6a2 2 0 0 0-3.2-1.6"
          />
    </Svg>
  );
}
