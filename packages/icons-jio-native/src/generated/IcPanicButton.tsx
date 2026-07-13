import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPanicButton(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-6 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8"
          />
    </Svg>
  );
}
