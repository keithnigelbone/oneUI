import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNextTitle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m16.2 10.4-8-6A2 2 0 0 0 5 6v12a2 2 0 0 0 3.2 1.6l8-6a2 2 0 0 0 0-3.2M18 4a1 1 0 0 0-1 1v14a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
