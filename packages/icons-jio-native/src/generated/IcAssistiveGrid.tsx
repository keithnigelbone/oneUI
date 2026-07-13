import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAssistiveGrid(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 14.33h4.67V9.67H3zM9.67 21h4.66v-4.67H9.67zM19 3h-2.67v4.67H21V5a2 2 0 0 0-2-2M3 19a2 2 0 0 0 2 2h2.67v-4.67H3zM3 5v2.67h4.67V3H5a2 2 0 0 0-2 2m13.33 16H19a2 2 0 0 0 2-2v-2.67h-4.67zm0-6.67H21V9.67h-4.67zM9.67 7.67h4.66V3H9.67zm0 6.66h4.66V9.67H9.67z"
          />
    </Svg>
  );
}
