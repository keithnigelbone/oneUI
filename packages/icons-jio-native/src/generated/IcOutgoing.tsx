import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOutgoing(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.92 4.62a1 1 0 0 0-.54-.54A1 1 0 0 0 19 4H9a1 1 0 0 0 0 2h7.59L4.29 18.29a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219L18 7.41V15a1 1 0 0 0 2 0V5a1 1 0 0 0-.08-.38"
          />
    </Svg>
  );
}
