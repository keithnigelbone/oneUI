import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWriting(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 17h-1.44l2.2-2.6a1 1 0 0 0 .08-1.19L13 2.7v7.58a2 2 0 1 1-2 0V2.7L4.16 13.21a1 1 0 0 0 .08 1.19l2.2 2.6H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
