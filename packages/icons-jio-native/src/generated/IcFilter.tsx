import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFilter(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 11H7a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2m-3 6h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2m6-12H4a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
