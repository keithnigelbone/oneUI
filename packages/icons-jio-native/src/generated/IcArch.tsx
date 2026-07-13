import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArch(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3A15 15 0 0 0 6 3"
          />
    </Svg>
  );
}
