import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCalendarSchedule(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13.5 14h-1v-2a1 1 0 0 0-2 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 0-2M18 3h-1a1 1 0 0 0-2 0H9a1 1 0 0 0-2 0H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-6 16a5 5 0 1 1 0-9.999A5 5 0 0 1 12 19m7-12H5V6a1 1 0 0 1 1-1h1a1 1 0 0 0 2 0h6a1 1 0 0 0 2 0h1a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
