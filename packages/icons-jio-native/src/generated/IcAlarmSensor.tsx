import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAlarmSensor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2m4-5v-3a4 4 0 1 0-8 0v3a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2M9.61 8.82a4 4 0 0 1 4.78 0 1.002 1.002 0 1 0 1.22-1.59 6 6 0 0 0-7.22 0 1.002 1.002 0 1 0 1.22 1.59m9.06-4.26a10 10 0 0 0-13.34 0 1.002 1.002 0 0 0 1.34 1.49 8 8 0 0 1 10.66 0 1 1 0 0 0 .67.25 1 1 0 0 0 .74-.3 1 1 0 0 0-.07-1.44"
          />
    </Svg>
  );
}
