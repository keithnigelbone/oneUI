import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMicroSd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 2h-5.76a3 3 0 0 0-2.12.88L5.88 5.12A3 3 0 0 0 5 7.24V19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-3 5a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0zm4 0a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
