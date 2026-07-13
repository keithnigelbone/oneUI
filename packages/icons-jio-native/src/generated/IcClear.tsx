import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcClear(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 17H4a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2m4-12H8a1 1 0 0 0 0 2h12a1 1 0 1 0 0-2m-2 6H6a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
