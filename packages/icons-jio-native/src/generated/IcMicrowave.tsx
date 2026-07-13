import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMicrowave(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3v1a1 1 0 1 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3m-4 10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1zm3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
