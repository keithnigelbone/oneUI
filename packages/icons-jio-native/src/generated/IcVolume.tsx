import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVolume(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 16.38a2 2 0 0 0 1.3 1.87l6.7 2.51v-9.08l-8-3.2zm10-4.73v9.11l6.7-2.51a2 2 0 0 0 1.3-1.87V8.09zm6.7-5.9-7-2.62a2 2 0 0 0-1.4 0l-7 2.62a2 2 0 0 0-.93.72L12 9.92l8.38-3.73a2 2 0 0 0-.68-.44"
          />
    </Svg>
  );
}
