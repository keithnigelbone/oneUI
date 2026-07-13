import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDisabled(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m11.89 13.55a1 1 0 0 0-1.34-.44l-1.1.55-2.56-5.11A1 1 0 0 0 16 13h-5v-2h4a1 1 0 0 0 0-2h-4V7a1 1 0 0 0-2 0v2a6.49 6.49 0 1 0 7 7.14l2.14 4.28A1 1 0 0 0 19 21a.93.93 0 0 0 .45-.11l2-1a1 1 0 0 0 .44-1.34M14 15.5a4.5 4.5 0 1 1-5-4.45V14a1 1 0 0 0 1 1h4z"
          />
    </Svg>
  );
}
