import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDoorOpen(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 2h-6.53l3.26 1.22A3.52 3.52 0 0 1 17 6.5V20h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2m-4 3.1-8-3a1.4 1.4 0 0 0-.5-.1 1.46 1.46 0 0 0-.85.27A1.49 1.49 0 0 0 4 3.5v13.3a1.5 1.5 0 0 0 .87 1.36l8 3.7c.198.09.413.138.63.14a1.51 1.51 0 0 0 1.5-1.5v-14a1.5 1.5 0 0 0-1-1.4m-2 8.4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
