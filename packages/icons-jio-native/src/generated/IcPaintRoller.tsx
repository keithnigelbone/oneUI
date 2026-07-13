import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPaintRoller(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2 1 1 0 0 0 0 2 2 2 0 0 0 2 2h10a2 2 0 0 0 2-2 1 1 0 0 1 1 1v2.23a1 1 0 0 1-.88 1l-5.37.67a2 2 0 0 0-1.75 2V14h-1a1 1 0 0 0-1 1v4a3 3 0 0 0 6 0v-4a1 1 0 0 0-1-1h-1v-1.12l5.37-.67a3 3 0 0 0 2.63-3V7a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
