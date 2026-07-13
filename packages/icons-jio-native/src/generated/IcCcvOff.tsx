import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCcvOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14.76 5H4a2 2 0 0 0-2 2v2h8.76zM22 9V7a2 2 0 0 0-1.62-2l.33-.33A1.005 1.005 0 0 0 20 2.956a1 1 0 0 0-.71.294l-16 16a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0L6.41 19H20a2 2 0 0 0 2-2v-6h-7.59l2-2zm-3 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-3 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2M2 11v6a2.2 2.2 0 0 0 .11.64L8.76 11z"
          />
    </Svg>
  );
}
