import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHeadlight(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m7.63 15.07-5 2a1 1 0 1 0 .74 1.86l5-2a1.002 1.002 0 0 0-.74-1.86M14 4h-1a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a8 8 0 0 0 0-16m-6 9a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2zm.37-5.93-5-2a1 1 0 1 0-.74 1.86l5 2a1 1 0 1 0 .74-1.86"
          />
    </Svg>
  );
}
