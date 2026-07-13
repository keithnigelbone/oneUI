import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGarage(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 21h10v-2H7zm0-4h10v-2H7zm0-4h10v-2H7zm13.06-5.32-7-4.38a2 2 0 0 0-2.12 0l-7 4.38A2 2 0 0 0 3 9.38V19a2 2 0 0 0 2 2V10.5A1.5 1.5 0 0 1 6.5 9h11a1.5 1.5 0 0 1 1.5 1.5V21a2 2 0 0 0 2-2V9.38a2 2 0 0 0-.94-1.7"
          />
    </Svg>
  );
}
