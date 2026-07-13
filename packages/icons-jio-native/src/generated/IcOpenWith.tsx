import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOpenWith(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 11a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 1 0 0-2H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m.92-7.38a1 1 0 0 0-.54-.54A1 1 0 0 0 20 3h-4a1 1 0 1 0 0 2h1.59l-6.3 6.29a1.002 1.002 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219L19 6.41V8a1 1 0 0 0 2 0V4a1 1 0 0 0-.08-.38"
          />
    </Svg>
  );
}
