import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmartDoorlock(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 8h-4V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-6h4a2 2 0 0 0 0-4M9 12h3.44a4 4 0 1 1 0-4H9a2 2 0 1 0 0 4"
          />
    </Svg>
  );
}
