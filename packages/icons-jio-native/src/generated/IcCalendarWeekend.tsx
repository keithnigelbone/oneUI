import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCalendarWeekend(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.12 3.88A3 3 0 0 0 18 3h-1a1 1 0 0 0-2 0H9a1 1 0 0 0-2 0H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-.88-2.12M13 16a1 1 0 0 1-2 0v-4a1 1 0 0 1 2 0zm6-9H5V6a1 1 0 0 1 1-1h1a1 1 0 0 0 2 0h6a1 1 0 0 0 2 0h1a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
