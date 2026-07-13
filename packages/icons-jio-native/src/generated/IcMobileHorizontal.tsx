import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMobileHorizontal(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M2 9v6a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3m18 3a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0"
          />
    </Svg>
  );
}
