import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAreaTypeJustify(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 5h16a1 1 0 1 0 0-2H4a1 1 0 0 0 0 2m16 14H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2m0-8H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
