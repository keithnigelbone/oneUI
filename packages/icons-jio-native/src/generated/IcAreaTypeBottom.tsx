import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAreaTypeBottom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 19H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2M4 11h16a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2m16 3H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
