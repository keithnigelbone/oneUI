import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWeek(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 21h3V3H8zM3 5v14a2 2 0 0 0 2 2h1V3H5a2 2 0 0 0-2 2m10 16h3V3h-3zm6-18h-1v18h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
