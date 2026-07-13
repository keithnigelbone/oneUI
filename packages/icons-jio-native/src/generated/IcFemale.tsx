import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFemale(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 16h-3v-2.09a6 6 0 1 0-2 0V16H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 1 0 0-2M8 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0"
          />
    </Svg>
  );
}
