import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArcade(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 18h-2v-.5a1.5 1.5 0 0 0-1.5-1.5H13v-5.14a4 4 0 1 0-2 0V16H9.5A1.5 1.5 0 0 0 8 17.5v.5H6a2 2 0 0 0 0 4h12a2 2 0 0 0 0-4"
          />
    </Svg>
  );
}
