import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMonth(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 5v6h4.67V3H5a2 2 0 0 0-2 2m0 14a2 2 0 0 0 2 2h2.67v-8H3zm6.67 2h4.66v-8H9.67zm6.66 0H19a2 2 0 0 0 2-2v-6h-4.67zM19 3h-2.67v8H21V5a2 2 0 0 0-2-2m-9.33 8h4.66V3H9.67z"
          />
    </Svg>
  );
}
