import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcEraser(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m15.41 16 5.3-5.29a1 1 0 0 0 .219-1.095 1 1 0 0 0-.22-.325l-6-6a1 1 0 0 0-1.42 0L7.38 9.21 14.17 16zM20 18h-6.67L6 10.62l-2.71 2.67a1 1 0 0 0 0 1.42l5 5A1 1 0 0 0 9 20h11a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
