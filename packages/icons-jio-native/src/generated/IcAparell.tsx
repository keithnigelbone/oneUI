import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAparell(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21.2 16.4-8-6a.8.8 0 0 0-.2-.1v-.48A3 3 0 1 0 9 7a1 1 0 0 0 2 0 1 1 0 1 1 1 1 1 1 0 0 0-1 1v1.3a.8.8 0 0 0-.2.1l-8 6A2 2 0 0 0 4 20h16a2 2 0 0 0 1.2-3.6M4 18l8-6 8 6z"
          />
    </Svg>
  );
}
