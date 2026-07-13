import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcClauset(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 4v14a2 2 0 0 0 2 2v1a1 1 0 1 0 2 0v-1h3V2H6a2 2 0 0 0-2 2m4 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2m10-8h-5v18h3v1a1 1 0 0 0 2 0v-1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2m-2 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
