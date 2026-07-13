import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function Ic4GBarFour(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 11a1 1 0 0 0-1 1v8a1 1 0 1 0 2 0v-8a1 1 0 0 0-1-1m8-8a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1M6 15a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1m8-8a1 1 0 0 0-1 1v12a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
