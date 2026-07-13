import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRedo(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.71 8.29-4-4a1.003 1.003 0 1 0-1.42 1.42L17.59 8H10a7 7 0 0 0-7 7v3a1 1 0 1 0 2 0v-3a5 5 0 0 1 5-5h7.59l-2.3 2.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 0-1.42"
          />
    </Svg>
  );
}
