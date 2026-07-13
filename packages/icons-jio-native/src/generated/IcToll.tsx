import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcToll(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 .84L6.15 8H11zm10 7H3a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-1h16v1a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1m-4-7.16A1 1 0 0 0 16 2h-2a1 1 0 0 0-1 1v5h4.85zm-13 18a1 1 0 0 0 .576 1.07A1 1 0 0 0 5 22h5a1 1 0 0 0 1-1v-7H5.15zM13 14v7a1 1 0 0 0 1 1h5a1 1 0 0 0 .99-1.16L18.85 14z"
          />
    </Svg>
  );
}
