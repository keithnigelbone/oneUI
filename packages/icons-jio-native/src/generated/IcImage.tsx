import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcImage(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m1 9.09-2.79-2.8a1 1 0 0 0-1.42 0l-4.29 4.3-1.29-1.3a1 1 0 0 0-1.42 0L5 15.09V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
