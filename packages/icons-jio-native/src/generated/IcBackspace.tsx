import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBackspace(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 10a1 1 0 0 0-1 1v1H4v-1a1 1 0 1 0-2 0v2a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
