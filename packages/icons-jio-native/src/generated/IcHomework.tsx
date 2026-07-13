import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHomework(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 5v14a2 2 0 0 0 2 2h1V3H5a2 2 0 0 0-2 2m16-2H8v18h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-2 7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
